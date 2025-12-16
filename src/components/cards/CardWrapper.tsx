"use client"

import { type ReactNode } from "react"
import { type CardId, type CardSize, getCardConfig } from "@/config/cards"

type CardWrapperProps = {
  cardId: CardId
  children: ReactNode
  className?: string
  // Override size for specific layouts
  size?: CardSize
  // Whether to show card header with title
  showHeader?: boolean
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function getSizeClasses(size: CardSize): string {
  switch (size) {
    case "small":
      return "min-h-[200px]"
    case "medium":
      return "min-h-[300px]"
    case "large":
      return "min-h-[400px]"
    case "full":
      return "min-h-[200px]"
    default:
      return ""
  }
}

export function CardWrapper({
  cardId,
  children,
  className,
  size,
  showHeader = false,
}: CardWrapperProps) {
  const config = getCardConfig(cardId)
  const effectiveSize = size ?? config.mobileSize

  return (
    <div
      className={cn(
        "w-full",
        getSizeClasses(effectiveSize),
        className
      )}
      data-card-id={cardId}
      data-card-size={effectiveSize}
    >
      {showHeader && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{config.title}</h3>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>
      )}
      {children}
    </div>
  )
}

// Higher-order component for wrapping existing cards
export function withCardWrapper<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  cardId: CardId
) {
  return function CardWithWrapper(props: P & { className?: string }) {
    return (
      <CardWrapper cardId={cardId} className={props.className}>
        <WrappedComponent {...props} />
      </CardWrapper>
    )
  }
}
