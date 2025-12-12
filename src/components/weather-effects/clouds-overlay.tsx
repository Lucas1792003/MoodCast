"use client"

type Props = {
  variant?: "light" | "dark"
}

export default function CloudsOverlay({ variant = "dark" }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
      data-variant={variant}
    >
      <div className="mc-cloud mc-cloud--1" />
      <div className="mc-cloud mc-cloud--2" />
      <div className="mc-cloud mc-cloud--3" />
      <div className="mc-cloud mc-cloud--4" />
      <div className="mc-cloud mc-cloud--5" />
    </div>
  )
}
