module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/MoodCast/src/app/api/suggestion/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/MoodCast/node_modules/next/server.js [app-route] (ecmascript)");
;
const runtime = "nodejs";
const cache = new Map();
function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function pickRandom(arr) {
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}
const INDOOR_IDEAS = [
    {
        headline: "Cozy reading time",
        message: "It’s rainy outside — perfect time to read 20–30 mins with a warm drink ☕📖"
    },
    {
        headline: "Board games with friends",
        message: "Rainy vibes = board game vibes. Invite a friend over (or play online) 🎲"
    },
    {
        headline: "Movie night",
        message: "Storm outside? Stay in and do a movie + snack combo 🍿"
    },
    {
        headline: "Home workout",
        message: "Try a quick 10–15 min stretch or bodyweight workout. Easy win 💪"
    },
    {
        headline: "Cook something warm",
        message: "Rain day cooking hits different. Make something warm + comforting 🍜"
    }
];
function indoorPrimary(kind) {
    if (kind === "storm") return INDOOR_IDEAS[2];
    if (kind === "rain" || kind === "drizzle") {
        return pickOne([
            INDOOR_IDEAS[0],
            INDOOR_IDEAS[1],
            INDOOR_IDEAS[4]
        ]);
    }
    return pickOne(INDOOR_IDEAS);
}
function indoorSecondary(count, excludeHeadline) {
    const pool = INDOOR_IDEAS.filter((x)=>x.headline !== excludeHeadline);
    const shuffled = [
        ...pool
    ].sort(()=>Math.random() - 0.5);
    return shuffled.slice(0, count);
}
function getCache(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expires) {
        cache.delete(key);
        return null;
    }
    return hit.value;
}
function setCache(key, value, ttlMs) {
    cache.set(key, {
        value,
        expires: Date.now() + ttlMs
    });
}
function toRad(d) {
    return d * Math.PI / 180;
}
function haversineM(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
function classifyWeather(code) {
    if (code === 0) return "clear";
    if (code === 1 || code === 2) return "partly";
    if (code === 3) return "cloudy";
    if (code === 45 || code === 48) return "fog";
    if ([
        51,
        53,
        55,
        56,
        57
    ].includes(code)) return "drizzle";
    if ([
        61,
        63,
        65,
        66,
        67,
        80,
        81,
        82
    ].includes(code)) return "rain";
    if ([
        71,
        73,
        75,
        77,
        85,
        86
    ].includes(code)) return "snow";
    if ([
        95,
        96,
        99
    ].includes(code)) return "storm";
    return "unknown";
}
function buildOverpassQuery(lat, lon, radiusM) {
    return `
[out:json][timeout:25];
(
  // desserts / cafes / food
  nwr(around:${radiusM},${lat},${lon})["amenity"~"cafe|ice_cream|restaurant|fast_food"];
  nwr(around:${radiusM},${lat},${lon})["shop"="bakery"];

  // parks / leisure
  nwr(around:${radiusM},${lat},${lon})["leisure"~"park|garden"];
  nwr(around:${radiusM},${lat},${lon})["natural"="peak"];

  // museums / galleries
  nwr(around:${radiusM},${lat},${lon})["tourism"~"museum|gallery|attraction|viewpoint"];

  // mall / cinema / markets
  nwr(around:${radiusM},${lat},${lon})["shop"="mall"];
  nwr(around:${radiusM},${lat},${lon})["amenity"~"cinema|theatre"];
  nwr(around:${radiusM},${lat},${lon})["amenity"="marketplace"];

  // fitness
  nwr(around:${radiusM},${lat},${lon})["leisure"~"fitness_centre|sports_centre"];
);
out center tags;
`;
}
async function fetchOverpass(lat, lon, radiusM) {
    const key = `overpass:${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusM}`;
    const cached = getCache(key);
    if (cached) return cached;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=UTF-8"
        },
        body: buildOverpassQuery(lat, lon, radiusM)
    });
    if (!res.ok) throw new Error(`Overpass error ${res.status}`);
    const json = await res.json();
    setCache(key, json, 8 * 60 * 1000); // 8 min
    return json;
}
function toCategory(tags) {
    const amenity = tags.amenity;
    const shop = tags.shop;
    const tourism = tags.tourism;
    const leisure = tags.leisure;
    if (amenity === "ice_cream" || shop === "bakery") return "dessert";
    if (amenity === "cafe") return "cafe";
    if (amenity === "restaurant" || amenity === "fast_food") return "food";
    if (shop === "mall") return "mall";
    if (amenity === "cinema" || amenity === "theatre") return "cinema";
    if (amenity === "marketplace") return "market";
    if (leisure === "park" || leisure === "garden") return "park";
    if (leisure === "fitness_centre" || leisure === "sports_centre") return "gym";
    if (tourism === "museum" || tourism === "gallery") return "museum";
    if (tourism === "viewpoint" || tourism === "attraction") return "photo";
    return "other";
}
function elementToPlace(el, userLat, userLon) {
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"];
    const lat = typeof el.lat === "number" ? el.lat : el.center?.lat;
    const lon = typeof el.lon === "number" ? el.lon : el.center?.lon;
    if (!name || typeof lat !== "number" || typeof lon !== "number") return null;
    const category = toCategory(tags);
    const distanceM = haversineM(userLat, userLon, lat, lon);
    const osmUrl = el?.type && el?.id ? `https://www.openstreetmap.org/${el.type}/${el.id}` : undefined;
    const addressParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:subdistrict"],
        tags["addr:district"],
        tags["addr:city"]
    ].filter(Boolean);
    const address = addressParts.length ? addressParts.join(" ") : undefined;
    return {
        id: `${el.type}/${el.id}`,
        name,
        category,
        lat,
        lon,
        distanceM,
        address,
        osmUrl
    };
}
function allowedCategories(kind, w) {
    const hot = w.temp >= 32;
    if (kind === "storm") {
        return new Set([
            "mall",
            "cafe",
            "dessert",
            "museum",
            "cinema",
            "gym",
            "food",
            "market"
        ]);
    }
    if (kind === "rain" || kind === "drizzle") {
        return new Set([
            "mall",
            "cafe",
            "dessert",
            "museum",
            "cinema",
            "gym",
            "food",
            "market"
        ]);
    }
    if (!w.isDay) {
        return new Set([
            "cafe",
            "dessert",
            "mall",
            "cinema",
            "food",
            "market",
            "photo"
        ]);
    }
    if (hot) {
        return new Set([
            "dessert",
            "mall",
            "cafe",
            "museum",
            "cinema",
            "food",
            "gym",
            "market"
        ]);
    }
    if (kind === "cloudy" || kind === "fog") {
        return new Set([
            "cafe",
            "food",
            "park",
            "museum",
            "photo",
            "mall",
            "dessert",
            "market"
        ]);
    }
    return new Set([
        "park",
        "photo",
        "cafe",
        "dessert",
        "food",
        "market",
        "museum"
    ]);
}
function vibeCopy(kind, w, place) {
    const hot = w.temp >= 32;
    const fallback = {
        headline: "Today’s vibe",
        message: kind === "rain" || kind === "storm" ? "It’s wet outside — go for something cozy indoors. A cafe + a small treat sounds perfect." : hot ? "It’s hot outside — pick something cool and easy. Dessert or an AC spot is a win." : "Looks like a nice day — go do something simple nearby and enjoy it."
    };
    if (!place) return fallback;
    const name = place.name;
    const cat = place.category;
    const placeLine = (msg)=>({
            headline: kind === "rain" || kind === "storm" ? "Rainy-day plan" : hot ? "Hot-day plan" : w.isDay ? "Daytime plan" : "Night plan",
            message: msg,
            place: {
                name: place.name,
                category: place.category,
                distanceM: place.distanceM,
                address: place.address,
                osmUrl: place.osmUrl
            }
        });
    if (hot && (cat === "dessert" || cat === "cafe")) {
        return placeLine(`Hey, it’s hot outside — why not cool down at **${name}**? Grab something sweet + hydrate.`);
    }
    if ((kind === "rain" || kind === "storm") && (cat === "mall" || cat === "museum" || cat === "cinema")) {
        return placeLine(`Rain vibes today — stay dry and comfy. **${name}** nearby could be a perfect indoor plan.`);
    }
    if ((kind === "rain" || kind === "drizzle") && (cat === "cafe" || cat === "dessert")) {
        return placeLine(`It’s rainy outside — cozy mode. Try **${name}** nearby for a warm drink + a small treat.`);
    }
    if (w.isDay && (cat === "park" || cat === "photo")) {
        return placeLine(`The weather looks friendly — how about heading to **${name}** for a short walk and a few nice photos?`);
    }
    if (!w.isDay && (cat === "market" || cat === "food" || cat === "cafe")) {
        return placeLine(`Night time = snack time 😄 **${name}** is nearby — go grab something and take it slow.`);
    }
    return placeLine(`Here’s a nearby idea: **${name}**. Keep it simple — go for 30–60 minutes and enjoy the vibe.`);
}
function toSecondary(place) {
    return {
        headline: place.name,
        message: `${place.category} · ~${Math.round(place.distanceM)}m away`,
        place: {
            name: place.name,
            category: place.category,
            distanceM: place.distanceM,
            address: place.address,
            osmUrl: place.osmUrl
        }
    };
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));
    const code = Number(searchParams.get("code") ?? 0);
    const isDay = (searchParams.get("isDay") ?? "1") === "1";
    const temp = Number(searchParams.get("temp") ?? 30);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing lat/lon"
        }, {
            status: 400
        });
    }
    const weatherUsed = {
        code,
        isDay,
        temp
    };
    const kind = classifyWeather(code);
    const radiusM = 2000;
    let elements = [];
    try {
        const overpass = await fetchOverpass(lat, lon, radiusM);
        elements = Array.isArray(overpass?.elements) ? overpass.elements : [];
    } catch  {
        elements = [];
    }
    const all = elements.map((el)=>elementToPlace(el, lat, lon)).filter(Boolean);
    const dedup = new Map();
    for (const p of all){
        const key = `${p.name.toLowerCase()}::${p.category}`;
        const prev = dedup.get(key);
        if (!prev || p.distanceM < prev.distanceM) dedup.set(key, p);
    }
    const pool = Array.from(dedup.values()).sort((a, b)=>a.distanceM - b.distanceM);
    const allowed = allowedCategories(kind, weatherUsed);
    const filtered = pool.filter((p)=>allowed.has(p.category)).slice(0, 80);
    const badWeather = kind === "storm" || kind === "rain" || kind === "drizzle";
    const preferIndoorPrimary = badWeather && Math.random() < 0.7;
    let primary;
    let secondary = [];
    try {
        const candidates = (filtered.length ? filtered : pool).slice(0, 30);
        const chosen = pickRandom(candidates);
        if (preferIndoorPrimary) {
            primary = indoorPrimary(kind);
            const nearbyIndoor = (filtered.length ? filtered : pool).filter((p)=>[
                    "mall",
                    "cafe",
                    "dessert",
                    "museum",
                    "cinema",
                    "gym",
                    "food",
                    "market"
                ].includes(p.category)).filter((p)=>chosen ? p.id !== chosen.id : true).slice(0, 30).sort(()=>Math.random() - 0.5).slice(0, 3).map(toSecondary);
            const extraIndoor = indoorSecondary(2, primary.headline);
            secondary = [
                ...nearbyIndoor,
                ...extraIndoor
            ].slice(0, 4);
        } else {
            primary = vibeCopy(kind, weatherUsed, chosen ?? undefined);
            const secondaryPlaces = (filtered.length ? filtered : pool).filter((p)=>chosen ? p.id !== chosen.id : true).slice(0, 30).sort(()=>Math.random() - 0.5).slice(0, 4).map(toSecondary);
            const backupIndoor = badWeather ? indoorSecondary(1, undefined) : [];
            secondary = [
                ...secondaryPlaces,
                ...backupIndoor
            ].slice(0, 4);
        }
    } catch  {
        primary = indoorPrimary(kind);
        secondary = indoorSecondary(4, primary.headline);
    }
    const out = {
        weatherUsed,
        kind,
        primary,
        secondary
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(out);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0b9cce17._.js.map