export default function RainOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      <div className="rain-layer" />
    </div>
  )
}
