import React from "react"
import { cn } from "./utils"

export function Pill({
  children,
  className,
  variant = "soft",
  size = "md",
}: {
  children: React.ReactNode
  className?: string
  variant?: "soft" | "outline"
  size?: "md" | "sm"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px] leading-none" : "px-3 py-2 text-xs",
        variant === "outline"
          ? "bg-white text-slate-700 border border-slate-200"
          : "bg-slate-100 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  )
}

export function ModeChip({
  active,
  label,
  icon,
  onClick,
  className,
  size = "md",
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
  size?: "md" | "sm"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px] leading-none" : "px-3 py-2 text-xs",
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
        className
      )}
    >
      {icon}
      {label}
    </button>
  )
}
