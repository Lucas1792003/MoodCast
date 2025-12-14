import { head } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATASET_PATHNAME = "datasets/outfits-latest.json";

export async function GET() {
  try {
    const meta = await head(DATASET_PATHNAME);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch blob: ${res.status}`);

    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ version: 1, generatedAt: null, outfits: [] });
  }
}
