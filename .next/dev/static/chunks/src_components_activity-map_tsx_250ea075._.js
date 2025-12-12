(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/activity-map.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActivityMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ActivityMap({ center, user, destination, routeGeojson }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const userMarkerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const destMarkerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ActivityMap.useEffect": ()=>{
            let isMounted = true;
            ({
                "ActivityMap.useEffect": async ()=>{
                    if (!containerRef.current || mapRef.current) return;
                    const maplibregl = (await __turbopack_context__.A("[project]/node_modules/maplibre-gl/dist/maplibre-gl.js [app-client] (ecmascript, async loader)")).default;
                    if (!isMounted) return;
                    // OpenFreeMap style URL (free public instance) :contentReference[oaicite:6]{index=6}
                    const map = new maplibregl.Map({
                        container: containerRef.current,
                        style: "https://tiles.openfreemap.org/styles/liberty",
                        center: [
                            center.lng,
                            center.lat
                        ],
                        zoom: 13
                    });
                    map.addControl(new maplibregl.NavigationControl({
                        visualizePitch: true
                    }), "top-right");
                    mapRef.current = map;
                }
            })["ActivityMap.useEffect"]();
            return ({
                "ActivityMap.useEffect": ()=>{
                    isMounted = false;
                    try {
                        mapRef.current?.remove?.();
                    } catch  {}
                    mapRef.current = null;
                    userMarkerRef.current = null;
                    destMarkerRef.current = null;
                }
            })["ActivityMap.useEffect"];
        }
    }["ActivityMap.useEffect"], [
        center.lat,
        center.lng
    ]);
    // Update markers + route
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ActivityMap.useEffect": ()=>{
            ;
            ({
                "ActivityMap.useEffect": async ()=>{
                    const map = mapRef.current;
                    if (!map) return;
                    const maplibregl = (await __turbopack_context__.A("[project]/node_modules/maplibre-gl/dist/maplibre-gl.js [app-client] (ecmascript, async loader)")).default;
                    // user marker
                    if (user) {
                        if (!userMarkerRef.current) {
                            userMarkerRef.current = new maplibregl.Marker({
                                color: "#111"
                            }).setLngLat([
                                user.lng,
                                user.lat
                            ]).addTo(map);
                        } else {
                            userMarkerRef.current.setLngLat([
                                user.lng,
                                user.lat
                            ]);
                        }
                    }
                    // destination marker
                    if (destination) {
                        if (!destMarkerRef.current) {
                            destMarkerRef.current = new maplibregl.Marker({
                                color: "#2563eb"
                            }).setLngLat([
                                destination.lng,
                                destination.lat
                            ]).addTo(map);
                        } else {
                            destMarkerRef.current.setLngLat([
                                destination.lng,
                                destination.lat
                            ]);
                        }
                    }
                    // route line
                    const sourceId = "route-source";
                    const layerId = "route-layer";
                    if (routeGeojson) {
                        if (map.getSource(sourceId)) {
                            ;
                            map.getSource(sourceId).setData(routeGeojson);
                        } else {
                            map.addSource(sourceId, {
                                type: "geojson",
                                data: routeGeojson
                            });
                            map.addLayer({
                                id: layerId,
                                type: "line",
                                source: sourceId,
                                layout: {
                                    "line-join": "round",
                                    "line-cap": "round"
                                },
                                paint: {
                                    "line-width": 5
                                }
                            });
                        }
                    } else {
                        // remove if present
                        if (map.getLayer(layerId)) map.removeLayer(layerId);
                        if (map.getSource(sourceId)) map.removeSource(sourceId);
                    }
                    // fit bounds if we have both
                    if (user && destination) {
                        const bounds = new maplibregl.LngLatBounds();
                        bounds.extend([
                            user.lng,
                            user.lat
                        ]);
                        bounds.extend([
                            destination.lng,
                            destination.lat
                        ]);
                        map.fitBounds(bounds, {
                            padding: 60,
                            maxZoom: 15
                        });
                    }
                }
            })["ActivityMap.useEffect"]();
        }
    }["ActivityMap.useEffect"], [
        user?.lat,
        user?.lng,
        destination?.lat,
        destination?.lng,
        routeGeojson
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-[360px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: containerRef,
            className: "w-full h-full"
        }, void 0, false, {
            fileName: "[project]/src/components/activity-map.tsx",
            lineNumber: 121,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/activity-map.tsx",
        lineNumber: 120,
        columnNumber: 5
    }, this);
}
_s(ActivityMap, "zVyHXp5IoEnBLhwVKzUVcAGnqho=");
_c = ActivityMap;
var _c;
__turbopack_context__.k.register(_c, "ActivityMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/activity-map.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/activity-map.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_activity-map_tsx_250ea075._.js.map