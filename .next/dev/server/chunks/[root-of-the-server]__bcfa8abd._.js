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
"[project]/MoodCast/src/app/api/outfits/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
function asNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}
function normalizeLocation(location) {
    const s = (location || "").trim();
    if (!s) return {
        tokens: [
            "global"
        ]
    };
    const parts = s.split(",").map((x)=>x.trim()).filter(Boolean);
    const city = parts[0] ?? "";
    const country = parts[1] ?? "";
    const tokens = [
        city,
        country,
        city.toLowerCase(),
        country.toLowerCase(),
        "global"
    ].filter(Boolean);
    if (country.toLowerCase() === "japan") tokens.push("JP", "jp");
    if (city.toLowerCase() === "tokyo") tokens.push("Tokyo", "tokyo");
    return {
        tokens
    };
}
/**
 * Plug your real provider here.
 * Keep it server-side so API keys stay safe.
 */ async function fetchProviderCatalog(_opts) {
    const baseUrl = process.env.OUTFIT_API_URL;
    if (!baseUrl) return null;
    // Example (adjust to your provider):
    // const url = new URL(baseUrl)
    // url.searchParams.set("location", _opts.location)
    // url.searchParams.set("gender", _opts.gender)
    // if (_opts.tempF != null) url.searchParams.set("tempF", String(_opts.tempF))
    // if (_opts.weatherCode != null) url.searchParams.set("weatherCode", String(_opts.weatherCode))
    //
    // const r = await fetch(url.toString(), {
    //   headers: { Authorization: `Bearer ${process.env.OUTFIT_API_KEY ?? ""}` },
    //   cache: "no-store",
    // })
    // if (!r.ok) return null
    // const data = await r.json()
    // return normalizeProviderResponse(data)
    return null;
}
/** Fallback catalog (still gendered + filterable like real data) */ function fallbackCatalog(location) {
    const { tokens } = normalizeLocation(location);
    const isTokyoish = tokens.includes("tokyo") || tokens.includes("Tokyo") || tokens.includes("jp") || tokens.includes("JP");
    return [
        // HEAD
        {
            id: "head-beanie",
            name: "Beanie",
            category: "head",
            gender: "unisex",
            maxTempF: 55,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "head-cap",
            name: "Baseball cap",
            category: "head",
            gender: "unisex",
            minTempF: 60,
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        // OUTER
        {
            id: "outer-puffer",
            name: "Puffer jacket",
            category: "outer",
            gender: "unisex",
            maxTempF: 45,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "outer-hoodie",
            name: isTokyoish ? "Streetwear hoodie" : "Hoodie",
            category: "outer",
            gender: "unisex",
            maxTempF: 65,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "outer-denim-jacket",
            name: "Denim jacket",
            category: "outer",
            gender: "unisex",
            minTempF: 55,
            maxTempF: 75,
            weather: [
                "cloudy",
                "wind",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "outer-rain-shell",
            name: "Rain shell",
            category: "outer",
            gender: "unisex",
            weather: [
                "rain",
                "storm"
            ],
            regions: [
                "global"
            ]
        },
        // TOP (gender-specific names!)
        {
            id: "top-thermal",
            name: "Thermal long-sleeve",
            category: "top",
            gender: "unisex",
            maxTempF: 45,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-sweater",
            name: "Crewneck sweater",
            category: "top",
            gender: "unisex",
            maxTempF: 60,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-tee",
            name: "T-shirt",
            category: "top",
            gender: "unisex",
            minTempF: 70,
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-male-oxford",
            name: "Oxford shirt",
            category: "top",
            gender: "male",
            minTempF: 55,
            maxTempF: 80,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-male-linen",
            name: "Linen shirt",
            category: "top",
            gender: "male",
            minTempF: 75,
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-female-blouse",
            name: "Light blouse",
            category: "top",
            gender: "female",
            minTempF: 70,
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "top-female-knit",
            name: "Knit cardigan top",
            category: "top",
            gender: "female",
            maxTempF: 70,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        // BOTTOM (gender-specific so male never sees skirt)
        {
            id: "bottom-jeans",
            name: "Jeans",
            category: "bottom",
            gender: "unisex",
            minTempF: 45,
            maxTempF: 75,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "bottom-shorts",
            name: "Shorts",
            category: "bottom",
            gender: "unisex",
            minTempF: 80,
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "bottom-male-chinos",
            name: "Chinos",
            category: "bottom",
            gender: "male",
            minTempF: 55,
            maxTempF: 80,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "bottom-male-trousers",
            name: "Straight-leg trousers",
            category: "bottom",
            gender: "male",
            minTempF: 45,
            maxTempF: 70,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "bottom-female-midi-skirt",
            name: "Midi skirt",
            category: "bottom",
            gender: "female",
            minTempF: 55,
            maxTempF: 80,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "bottom-female-wide-leg",
            name: "Wide-leg pants",
            category: "bottom",
            gender: "female",
            minTempF: 45,
            maxTempF: 75,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        // SHOES
        {
            id: "shoes-waterproof",
            name: "Waterproof sneakers",
            category: "shoes",
            gender: "unisex",
            weather: [
                "rain",
                "storm",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "shoes-sneakers",
            name: "Sneakers",
            category: "shoes",
            gender: "unisex",
            weather: [
                "clear",
                "cloudy",
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "shoes-boots",
            name: "Boots",
            category: "shoes",
            gender: "unisex",
            maxTempF: 55,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        // ACCESSORY
        {
            id: "acc-scarf",
            name: "Scarf",
            category: "accessory",
            gender: "unisex",
            maxTempF: 50,
            weather: [
                "any"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "acc-umbrella",
            name: "Umbrella",
            category: "accessory",
            gender: "unisex",
            weather: [
                "rain",
                "storm"
            ],
            regions: [
                "global"
            ]
        },
        {
            id: "acc-sunglasses",
            name: "Sunglasses",
            category: "accessory",
            gender: "unisex",
            minTempF: 70,
            weather: [
                "clear",
                "any"
            ],
            regions: [
                "global"
            ]
        }
    ];
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const location = (searchParams.get("location") ?? "").trim();
    const gender = searchParams.get("gender") ?? "unisex";
    const lat = asNum(searchParams.get("lat"));
    const lon = asNum(searchParams.get("lon"));
    const tempF = asNum(searchParams.get("tempF"));
    const weatherCode = asNum(searchParams.get("weatherCode"));
    const provider = await fetchProviderCatalog({
        location,
        lat,
        lon,
        gender,
        tempF,
        weatherCode
    });
    const items = provider ?? fallbackCatalog(location);
    return __TURBOPACK__imported__module__$5b$project$5d2f$MoodCast$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        items,
        meta: {
            location,
            gender,
            lat,
            lon,
            tempF,
            weatherCode
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bcfa8abd._.js.map