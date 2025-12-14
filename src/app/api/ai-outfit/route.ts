import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATASET_PATHNAME = "datasets/outfits-latest.json";

type Category = "head" | "outer" | "top" | "bottom" | "shoes" | "accessory";
type Gender = "male" | "female" | "unisex";

type AiOutfit = {
  styleTitle: string;
  pieces: Record<Category, string>;
  reason?: string;
};

type OutfitRow = {
  id: string;
  region: string; // e.g. "th", "jp", "global", "tokyo"
  gender: Gender;
  min_temp_c: number;
  max_temp_c: number;
  weather_tags: string[]; // e.g. ["rain","humid","cloudy"] or ["any"]
  outfit_json: unknown;   // ideally AiOutfit
  keywords?: string[];
};

type Dataset = {
  version: number;
  generatedAt: string | null;
  outfits: OutfitRow[];
};

function weatherTagsFromCode(weatherCode: number): string[] {
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isStorm = weatherCode >= 95 && weatherCode <= 99;
  const isClear = weatherCode === 0 || weatherCode === 1;
  const isCloudy = weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48;

  const tags: string[] = [];
  if (isRain) tags.push("rain");
  if (isSnow) tags.push("snow");
  if (isStorm) tags.push("storm");
  if (isClear) tags.push("clear");
  if (isCloudy) tags.push("cloudy");
  if (tags.length === 0) tags.push("any");
  return tags;
}

function fToC(f: number) {
  return (f - 32) * (5 / 9);
}

function normalizeLocationTokens(locationLabel: string) {
  const s = (locationLabel || "").trim();
  if (!s) return ["global"];

  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  const city = parts[0] ?? "";
  const country = parts[1] ?? "";

  const tokens = [
    city,
    country,
    city.toLowerCase(),
    country.toLowerCase(),
    "global",
  ].filter(Boolean);

  // a couple helpful shortcuts
  if (country.toLowerCase() === "japan") tokens.push("jp", "JP");
  if (country.toLowerCase() === "thailand") tokens.push("th", "TH");
  return tokens.map((t) => String(t));
}

// simple deterministic hash -> number
function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 RNG (same idea as your client)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isAiOutfit(x: any): x is AiOutfit {
  const cats: Category[] = ["head", "outer", "top", "bottom", "shoes", "accessory"];
  return (
    x &&
    typeof x.styleTitle === "string" &&
    x.pieces &&
    cats.every((k) => typeof x.pieces?.[k] === "string" && x.pieces[k].trim().length > 0)
  );
}

async function loadDataset(): Promise<Dataset> {
  try {
    const meta = await head(DATASET_PATHNAME);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetch blob failed ${res.status}`);
    return (await res.json()) as Dataset;
  } catch {
    return { version: 1, generatedAt: null, outfits: [] };
  }
}

function matchesWeather(row: OutfitRow, needed: string[]) {
  const tags = row.weather_tags?.length ? row.weather_tags : ["any"];
  if (tags.includes("any")) return true;
  return needed.some((t) => tags.includes(t));
}

function matchesTemp(row: OutfitRow, tempC: number) {
  const min = typeof row.min_temp_c === "number" ? row.min_temp_c : -999;
  const max = typeof row.max_temp_c === "number" ? row.max_temp_c : 999;
  return tempC >= min && tempC <= max;
}

function matchesRegion(row: OutfitRow, tokens: string[]) {
  const r = (row.region || "global").toLowerCase();
  if (r === "global") return true;

  // match exact region token
  if (tokens.some((t) => t.toLowerCase() === r)) return true;

  // optionally match keywords
  const kws = (row.keywords || []).map((k) => k.toLowerCase());
  return tokens.some((t) => kws.includes(t.toLowerCase()));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const gender = (body.gender as Gender) || "female";
  const seed = Number(body.seed ?? 1);
  const locationLabel = String(body.locationLabel ?? "");
  const tempF = Number(body.temperature ?? NaN);
  const weatherCode = Number(body.weatherCode ?? NaN);

  if (!Number.isFinite(tempF) || !Number.isFinite(weatherCode)) {
    return NextResponse.json({ error: "Missing temperature/weatherCode" }, { status: 400 });
  }

  const tempC = fToC(tempF);
  const neededWeather = weatherTagsFromCode(weatherCode);
  const tokens = normalizeLocationTokens(locationLabel);

  const ds = await loadDataset();

  const base = ds.outfits.filter((row) => {
    return (
        matchesRegion(row, tokens) &&
        matchesTemp(row, tempC) &&
        matchesWeather(row, neededWeather)
    );
    });

    // ✅ prefer exact gender
    const genderSpecific = base.filter((row) => row.gender === gender);

    // ✅ only fallback to unisex if no exact-gender results
    const unisexOnly = base.filter((row) => row.gender === "unisex");

    const finalPool = genderSpecific.length ? genderSpecific : unisexOnly;

    if (!finalPool.length) {
    return NextResponse.json({ error: "No cached outfit for this query yet" }, { status: 404 });
    }


  // deterministic pick (same query -> same result; seed changes -> different)
  const requestKey = JSON.stringify({
    gender,
    seed,
    locationLabel,
    t: Math.round(tempF),
    wc: weatherCode,
  });

  const rand = mulberry32(hashString(requestKey));
  const picked = finalPool[Math.floor(rand() * finalPool.length)]!;


  // If you stored AiOutfit in outfit_json, return it directly.
  if (isAiOutfit(picked.outfit_json)) {
    return NextResponse.json(picked.outfit_json);
  }

  // Fallback conversion if outfit_json is something else
  const fallback: AiOutfit = {
    styleTitle: `Outfit • ${picked.region}`,
    pieces: {
      head: "Cap",
      outer: "Light jacket",
      top: "T-shirt",
      bottom: "Pants/Shorts",
      shoes: "Sneakers",
      accessory: "Watch",
    },
    reason: "Using cached outfit dataset (outfit_json was not AiOutfit format).",
  };

  return NextResponse.json(fallback);
}
