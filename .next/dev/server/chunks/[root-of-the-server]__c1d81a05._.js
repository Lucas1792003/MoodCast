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
"[project]/MoodCast/src/app/api/weather/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
function labelLooksWeak(label) {
    if (!label) return true;
    const s = label.toLowerCase();
    if (s.includes("subdistrict")) return true;
    if (s.includes("district") && !s.includes("city")) return true;
    return false;
}
async function reverseLabel(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "MoodCast/1.0",
                "Accept-Language": "en"
            },
            cache: "no-store"
        });
        if (!res.ok) return null;
        const data = await res.json();
        const addr = data?.address ?? {};
        const main = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || null;
        const admin = addr.state || addr.county || addr.region || null;
        const country = addr.country || null;
        if (main) return [
            main,
            admin,
            country
        ].filter(Boolean).join(", ");
        return data?.display_name ?? null;
    } catch  {
        return null;
    }
}
async function nearbyPoi(lat, lon) {
    try {
        const radius = 3000;
        const q = `
[out:json][timeout:20];
(
  nwr(around:${radius},${lat},${lon})[name][amenity~"university|college|school|hospital|clinic|restaurant|cafe|cinema|theatre|library|marketplace"];
  nwr(around:${radius},${lat},${lon})[name][shop~"mall|supermarket|department_store"];
  nwr(around:${radius},${lat},${lon})[name][tourism~"attraction|museum"];
  nwr(around:${radius},${lat},${lon})[name][leisure="park"];
);
out center 80;
`;
        const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=UTF-8",
                "User-Agent": "MoodCast/1.0"
            },
            body: q,
            cache: "no-store"
        });
        if (!res.ok) return null;
        const data = await res.json();
        const els = Array.isArray(data?.elements) ? data.elements : [];
        if (els.length === 0) return null;
        const toRad = (d)=>d * Math.PI / 180;
        const distM = (aLat, aLon, bLat, bLon)=>{
            const R = 6371000;
            const dLat = toRad(bLat - aLat);
            const dLon = toRad(bLon - aLon);
            const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
            return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        };
        const scored = els.map((el)=>{
            const name = el?.tags?.name;
            if (!name) return null;
            const elLat = typeof el.lat === "number" ? el.lat : el?.center?.lat;
            const elLon = typeof el.lon === "number" ? el.lon : el?.center?.lon;
            if (typeof elLat !== "number" || typeof elLon !== "number") return null;
            return {
                name,
                d: distM(lat, lon, elLat, elLon)
            };
        }).filter(Boolean);
        scored.sort((a, b)=>a.d - b.d);
        return scored[0]?.name ?? null;
    } catch  {
        return null;
    }
}
const numOrNull = (v)=>typeof v === "number" && Number.isFinite(v) ? v : null;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));
    const providedName = (searchParams.get("name") ?? "").trim();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid lat/lon"
        }, {
            status: 400
        });
    }
    // ✅ Request more variables for your cycler pages
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` + `&current=` + [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "dew_point_2m",
        "weather_code",
        "is_day",
        "visibility",
        "cloud_cover",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "uv_index",
        // some locations/models may not support it in current, so we also fetch hourly below
        "precipitation_probability"
    ].join(",") + `&hourly=precipitation_probability&forecast_hours=1` + `&daily=sunrise,sunset&forecast_days=1` + `&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const res = await fetch(url, {
        next: {
            revalidate: 300
        }
    });
    if (!res.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Weather fetch failed"
        }, {
            status: 502
        });
    }
    const data = await res.json();
    const c = data?.current;
    if (!c) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing current weather"
        }, {
            status: 502
        });
    }
    // ✅ Build a better locationName when name is missing (Current Location flow)
    let locationName = providedName;
    if (!locationName) {
        const rev = await reverseLabel(lat, lon);
        if (labelLooksWeak(rev)) {
            const poi = await nearbyPoi(lat, lon);
            locationName = poi || rev || "Near you";
        } else {
            locationName = rev || "Near you";
        }
    }
    // Precip prob: prefer current if present, else hourly[0]
    const probFromCurrent = numOrNull(c.precipitation_probability);
    const probFromHourly = numOrNull(data?.hourly?.precipitation_probability?.[0]);
    const precipitationProbability = probFromCurrent ?? probFromHourly;
    const out = {
        locationName,
        temperature: c.temperature_2m,
        feelsLike: c.apparent_temperature,
        weatherCode: c.weather_code,
        windSpeed: c.wind_speed_10m,
        humidity: c.relative_humidity_2m,
        visibility: c.visibility,
        latitude: lat,
        longitude: lon,
        isDay: Boolean(c.is_day),
        sunrise: data?.daily?.sunrise?.[0] ?? null,
        sunset: data?.daily?.sunset?.[0] ?? null,
        // ✅ extras
        uvIndex: numOrNull(c.uv_index),
        cloudCover: numOrNull(c.cloud_cover),
        pressureMsl: numOrNull(c.pressure_msl),
        surfacePressure: numOrNull(c.surface_pressure),
        dewPoint: numOrNull(c.dew_point_2m),
        precipitationProbability,
        precipitation: numOrNull(c.precipitation),
        rain: numOrNull(c.rain),
        showers: numOrNull(c.showers),
        snowfall: numOrNull(c.snowfall),
        windGusts: numOrNull(c.wind_gusts_10m),
        windDirection: numOrNull(c.wind_direction_10m)
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(out);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c1d81a05._.js.map