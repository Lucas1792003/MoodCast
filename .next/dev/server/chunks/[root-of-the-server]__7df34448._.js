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
"[project]/src/app/api/reverse-city/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const runtime = "nodejs";
function pickFirst(addr, keys) {
    for (const k of keys){
        const v = addr?.[k];
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
}
function cleanName(s) {
    return s.replace(/\bsubdistrict\b/gi, "").replace(/\bdistrict\b/gi, "").replace(/\bprovince\b/gi, "").replace(/\bstate\b/gi, "").replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
}
function looksTooLocal(s) {
    const t = s.toLowerCase();
    return t.includes("subdistrict") || t.includes("village") || t.includes("neighbourhood");
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid lat/lon"
        }, {
            status: 400
        });
    }
    // zoom=10 tends to be “city/region”, not street/subdistrict
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "MoodCast/1.0",
            "Accept-Language": "en"
        },
        cache: "no-store"
    });
    if (!res.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Reverse geocode failed"
        }, {
            status: 502
        });
    }
    const data = await res.json();
    const addr = data?.address ?? {};
    const country = cleanName(pickFirst(addr, [
        "country"
    ]) || "");
    // “City-ish” candidates
    let city = pickFirst(addr, [
        "city",
        "town",
        "municipality",
        "village",
        "county",
        "state_district"
    ]) || "";
    let region = pickFirst(addr, [
        "state",
        "region",
        "province"
    ]) || "";
    city = cleanName(city);
    region = cleanName(region);
    // If city is too local (subdistrict-level), fall back to region as “city”
    if (!city || looksTooLocal(city)) {
        city = region || city;
    }
    // Final query your app understands: City + Country (keep it simple for your DB)
    const query = [
        city,
        country
    ].filter(Boolean).join(", ").trim() || "Thailand";
    const label = query // what you show inside the search bar
    ;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        city,
        region,
        country,
        query,
        label
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7df34448._.js.map