"use client"

export default function SunRaysOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
      <div className="mc-sunrays" />
    </div>
  )
}
