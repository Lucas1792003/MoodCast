"use client"

function pickVariant(i: number) {

  const x = Math.sin((i + 1) * 999) * 10000
  return Math.floor((x - Math.floor(x)) * 2) 
}

export default function LeavesOverlay({ variant }: { variant: "sakura" | "autumn" }) {
  const count = 40 

  const src1 = variant === "sakura" ? "/sakura_1.png" : "/autumn_1.png"
  const src2 = variant === "sakura" ? "/sakura_2.png" : "/autumn_2.png"

  return (
    <div className="leaves-container" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const src = pickVariant(i) === 0 ? src1 : src2
        return (
          <span
            key={i}
            className={`leaf leaf-img ${variant === "sakura" ? "leaf-sakura" : "leaf-autumn"}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        )
      })}
    </div>
  )
}
