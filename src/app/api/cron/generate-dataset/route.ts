import { head, del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATASET_PATHNAME = "datasets/outfits-latest.json";

// ---- Types ----
type Category = "head" | "outer" | "top" | "bottom" | "shoes" | "accessory";

type AiOutfit = {
  styleTitle: string;
  pieces: Record<Category, string>;
  reason?: string;
};

type Outfit = {
  id: string;
  region: string;
  gender: "female" | "male" | "unisex";
  min_temp_c: number;
  max_temp_c: number;
  weather_tags: Array<"any" | "rain" | "snow" | "wind" | "clear" | "cloudy" | "storm">;
  outfit_json: AiOutfit;
  keywords: string[];
};

type Dataset = {
  version: number;
  generatedAt: string | null;
  outfits: Outfit[];
};

// ---- Auth ----
function assertCronAuth(request: Request) {
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

// ---- Blob helpers ----
async function loadExistingDataset(): Promise<Dataset> {
  try {
    const meta = await head(DATASET_PATHNAME);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    return (await res.json()) as Dataset;
  } catch {
    return { version: 1, generatedAt: null, outfits: [] };
  }
}

async function overwriteJson(pathname: string, jsonString: string) {
  try {
    const meta = await head(pathname);
    await del(meta.url);
  } catch {
    // ignore if it doesn't exist yet
  }

  await put(pathname, jsonString, {
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60 * 10,
    access: "public",
  });
}

// ---- Utility ----
function yyyymmddUTC() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function safeSlug(s: string) {
  return (s || "x")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function mergeDedupe(oldData: Dataset, newOutfits: Outfit[]): Dataset {
  const map = new Map<string, Outfit>();
  for (const o of oldData.outfits) map.set(o.id, o);
  for (const o of newOutfits) map.set(o.id, o); // same id replaces

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    outfits: Array.from(map.values()),
  };
}

// ---- Style Title helpers (✅ your requirement) ----
function bandToStyleLabel(bandLabel: string) {
  if (bandLabel === "hot") return "Light & Breezy";
  if (bandLabel === "warm") return "Easy Comfort";
  if (bandLabel === "cool") return "Layered Casual";
  if (bandLabel === "cold") return "Warm Layers";
  return "Everyday Fit";
}

function regionToCity(region: string) {
  const r = (region || "").toLowerCase().trim();

  const map: Record<string, string> = {
    thailand: "Bangkok",
    singapore: "Singapore",
    malaysia: "Kuala Lumpur",
    vietnam: "Ho Chi Minh City",
    indonesia: "Jakarta",
    philippines: "Manila",
    japan: "Tokyo",
    "south korea": "Seoul",
    "hong kong": "Hong Kong",
    taiwan: "Taipei",
    india: "Mumbai",
    china: "Shanghai",
    global: "Global",

    
    th: "Bangkok",
    sg: "Singapore",
    jp: "Tokyo",
    kr: "Seoul",
  };

  return map[r] ?? region.toUpperCase();
}


// ---- Gemini (optional) ----
async function callGeminiJSON(prompt: string): Promise<AiOutfit | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
    key
  )}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 400,
    },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) return null;

  const data: any = await r.json().catch(() => null);
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ?? "";

  // Extract first JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const jsonStr = text.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonStr);
    const cats: Category[] = ["head", "outer", "top", "bottom", "shoes", "accessory"];
    const ok =
      parsed &&
      typeof parsed.styleTitle === "string" &&
      parsed.pieces &&
      cats.every((c) => typeof parsed.pieces?.[c] === "string" && parsed.pieces[c].trim().length > 0);

    return ok ? (parsed as AiOutfit) : null;
  } catch {
    return null;
  }
}

function templateOutfit(
  region: string,
  gender: Outfit["gender"],
  weather: Outfit["weather_tags"][number],
  bandLabel: string
): AiOutfit {
  const isRainy = weather === "rain" || weather === "storm";
  const isCoolish = bandLabel === "cool" || bandLabel === "cold";

  const style = bandToStyleLabel(bandLabel);
  const city = regionToCity(region);

  return {
    styleTitle: `${style} • ${city}`, // ✅ correct format
    pieces: {
      head: isRainy ? "Bucket hat" : "Cap / Beanie",
      outer: isRainy ? "Light rain jacket" : isCoolish ? "Light jacket" : "Cardigan / Light jacket",
      top: gender === "female" ? "Blouse / T-shirt" : "T-shirt / Oxford",
      bottom: gender === "female" ? "Wide-leg pants / Jeans" : "Chinos / Jeans",
      shoes: "Sneakers",
      accessory: isRainy ? "Umbrella" : "Sunglasses",
    },
    reason: `Optimized for ${city} (${bandLabel}, ${weather}).`,
  };
}

// ---- Batch generation ----
async function generateBatch(): Promise<Outfit[]> {
  // ✅ Add regions later
  const regions = ["th", "global"];
  const genders: Outfit["gender"][] = ["female", "male"];

  const weatherList: Outfit["weather_tags"][number][] = ["clear", "cloudy", "rain"];

  const tempBands = [
    { label: "hot", min: 28, max: 40 },
    { label: "warm", min: 22, max: 30 },
  ];

  const variantsPerCombo = 2;
  const maxPerRun = 20;

  const runKey = yyyymmddUTC();
  const out: Outfit[] = [];

  for (const region of regions) {
    for (const gender of genders) {
      for (const w of weatherList) {
        for (const band of tempBands) {
          for (let v = 0; v < variantsPerCombo; v++) {
            if (out.length >= maxPerRun) return out;

            const id = [
              "ds",
              runKey,
              safeSlug(region),
              gender,
              band.label,
              w,
              `v${v}`,
            ].join("_");

            // ✅ force your preferred title format
            const styleTitle = `${bandToStyleLabel(band.label)} • ${regionToCity(region)}`;

            const prompt = `
Return ONLY valid JSON (no markdown) in this exact shape:
{
  "styleTitle": "string",
  "pieces": {
    "head": "string",
    "outer": "string",
    "top": "string",
    "bottom": "string",
    "shoes": "string",
    "accessory": "string"
  },
  "reason": "string"
}

Rules:
- styleTitle MUST be exactly: "${styleTitle}"
- Avoid brand names.
- Keep each piece 2-6 words, practical and wearable.

Context:
- Region vibe: ${region}
- Gender: ${gender}
- Weather: ${w}
- Temperature: ${band.min}C to ${band.max}C
`.trim();

            const ai = await callGeminiJSON(prompt);

            // If Gemini returns wrong title, enforce it anyway
            const outfit_json: AiOutfit =
              ai && ai.styleTitle === styleTitle
                ? ai
                : { ...(ai ?? templateOutfit(region, gender, w, band.label)), styleTitle };

            out.push({
              id,
              region,
              gender,
              min_temp_c: band.min,
              max_temp_c: band.max,
              weather_tags: [w],
              outfit_json,
              keywords: [region, gender, band.label, w],
            });
          }
        }
      }
    }
  }

  return out;
}

// ---- Route ----
export async function GET(request: Request) {
  const unauthorized = assertCronAuth(request);
  if (unauthorized) return unauthorized;

  const existing = await loadExistingDataset();
  const newlyGenerated = await generateBatch();
  const merged = mergeDedupe(existing, newlyGenerated);

  await overwriteJson(DATASET_PATHNAME, JSON.stringify(merged));

  return NextResponse.json({
    ok: true,
    added: newlyGenerated.length,
    before: existing.outfits.length,
    after: merged.outfits.length,
    generatedAt: merged.generatedAt,
  });
}
