"use client"

export default function HeatwaveOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
      <div className="mc-heat" />
      <div className="mc-heat mc-heat--2" />
    </div>
  )
}
