import React from "react"
import { Sparkles, MapPin, Route, Clock } from "lucide-react"
import { Pill } from "./ui"
import { cn, formatDuration, categoryPillClass } from "./utils"
import type { ApiOut, TravelMeta } from "./types"

export function PrimaryCard({
  data,
  clickable,
  active,
  onSelect,
  travel,
}: {
  data: ApiOut["primary"]
  clickable?: boolean
  active?: boolean
  onSelect?: () => void
  travel?: TravelMeta | null
}) {
  const Box: any = clickable ? "button" : "div"
  const eta = formatDuration(travel?.durationS)

  return (
    <Box
      type={clickable ? "button" : undefined}
      onClick={clickable ? onSelect : undefined}
      className={cn(
        "w-full rounded-3xl border bg-white shadow-sm p-5 text-left transition",
        clickable && "hover:shadow-md hover:-translate-y-[1px]",
        active ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
      )}
    >
      <div className="flex items-center gap-2 text-slate-900">
        <Sparkles className="w-5 h-5" />
        <div className="font-semibold">{data.headline}</div>
      </div>

      <div className="mt-3 text-slate-800 leading-relaxed">
        <span
          dangerouslySetInnerHTML={{
            __html: data.message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      {data.place && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
          <Pill className="border border-blue-100 bg-blue-50 text-blue-700">
            <Route className="w-3.5 h-3.5" />
            ~{Math.round((travel?.distanceM ?? data.place.distanceM) || 0)}m
          </Pill>

          {eta && (
            <Pill className="border border-violet-100 bg-violet-50 text-violet-700">
              <Clock className="w-3.5 h-3.5" />
              {eta}
            </Pill>
          )}

          <Pill className={categoryPillClass(data.place.category)}>{data.place.category}</Pill>

          {data.place.address && (
            <Pill className="max-w-full">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[260px]">{data.place.address}</span>
            </Pill>
          )}
        </div>
      )}

      {clickable && <div className="mt-3 text-xs text-slate-500">Click to route to this place</div>}
    </Box>
  )
}
