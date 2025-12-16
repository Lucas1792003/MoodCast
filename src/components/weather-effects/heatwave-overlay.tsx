"use client"

export default function HeatwaveOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
    >
      {/* main shimmer */}
      <div className="mc-heat" />
      {/* secondary shimmer (offset + slower) */}
      <div className="mc-heat mc-heat--2" />
      {/* tiny sparkle dust (subtle + fun) */}
      <div className="mc-heat-sparkle" />
    </div>
  )
}
