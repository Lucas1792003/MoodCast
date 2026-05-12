import { Route, Clock } from "lucide-react"
import { Pill } from "./ui"
import { cn, formatDuration, metricPillClass, categoryPillClass } from "./utils"
import type { TravelMeta } from "./types"

export function SuggestionCard({
  title,
  subtitle,
  address,
  active,
  onSelect,
  category,
  travel,
  distanceFallbackM,
}: {
  title: string
  subtitle: string
  address?: string
  active: boolean
  onSelect?: () => void
  category?: string
  travel?: TravelMeta | null
  distanceFallbackM?: number
}) {
  const eta = formatDuration(travel?.durationS)
  const distM =
    typeof travel?.distanceM === "number"
      ? travel.distanceM
      : typeof distanceFallbackM === "number"
        ? distanceFallbackM
        : undefined

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-2xl border bg-white p-3 sm:p-4 transition",
        "hover:shadow-sm hover:-translate-y-[1px]",
        active ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200",
        "min-h-[120px] sm:min-h-[140px] w-full flex flex-col"
      )}
    >
      <div className="min-h-0">
        <div className="font-semibold text-slate-900 text-[13px] sm:text-[15px] leading-snug line-clamp-2">{title}</div>
        {subtitle ? <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 line-clamp-1">{subtitle}</div> : null}
      </div>

      <div className="mt-auto pt-2 sm:pt-3">
        {/* Mobile: inline text, Desktop: pills */}
        <div className="hidden sm:grid grid-cols-3 gap-2 text-xs">
          <Pill size="sm" className={cn("w-full justify-center", metricPillClass("distance"))}>
            <Route className="w-3.5 h-3.5 shrink-0" />
            {typeof distM === "number" ? `~${Math.round(distM)}m` : "—"}
          </Pill>

          <Pill size="sm" className={cn("w-full justify-center", metricPillClass("time"))}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {eta ?? "—"}
          </Pill>

          <Pill size="sm" className={cn("w-full justify-center", categoryPillClass(category))}>
            {category ?? "other"}
          </Pill>
        </div>

        {/* Mobile: compact inline display - distance + category only */}
        <div className="flex sm:hidden items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Route className="w-3 h-3" />
            {typeof distM === "number" ? `${Math.round(distM)}m` : "—"}
          </span>
          {category && (
            <>
              <span className="text-slate-300">·</span>
              <span className="truncate">{category}</span>
            </>
          )}
        </div>

        <div className={cn("text-[11px] sm:text-xs mt-1 sm:mt-2 line-clamp-1", address ? "text-slate-500" : "text-slate-400")}>
          {address || " "}
        </div>
      </div>
    </button>
  )
}
