"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Search, Navigation, X, Info } from "lucide-react"
import AboutModal from "./about-modal"

interface HeaderProps {
  onSearch: (location: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchInput, setSearchInput] = useState("")
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = searchInput.trim()
    if (!value) return
    onSearch(value)
  }

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords

        const fallbackLabel = "Current location"
        setSearchInput(fallbackLabel)
        onSearch(`geo:${latitude},${longitude}|${encodeURIComponent(fallbackLabel)}`)

        void (async () => {
          try {
            const r = await fetch(`/api/reverse-city?lat=${latitude}&lon=${longitude}`, {
              cache: "no-store",
            })
            if (!r.ok) return
            const data = await r.json()
            const label =
              typeof data?.label === "string" && data.label.trim() ? data.label.trim() : ""

            if (!label) return

            setSearchInput(label)
            onSearch(`geo:${latitude},${longitude}|${encodeURIComponent(label)}`)
          } catch {

          }
        })()

        setIsLocating(false)
      },
      (err) => {
        console.error(err)
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) alert("Location permission denied.")
        else alert("Failed to get your location.")
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      }
    )
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="flex h-16 items-center gap-2 sm:gap-4">

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border">
                <Image
                  src="/app_icon.png"
                  alt="MoodCast"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </div>

              <div className="hidden sm:block leading-tight min-w-0">
                <h1 className="text-lg font-bold text-foreground">MoodCast</h1>
                <p className="text-xs text-muted-foreground">Weather-powered outfits & vibes</p>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex justify-center">
              <form onSubmit={handleSubmit} className="w-full max-w-none sm:max-w-xl min-w-0">
                <div className="h-11 w-full flex items-center rounded-full border border-border bg-muted/70 px-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/35 min-w-0">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-2 rounded-full px-2 sm:px-3 py-2 text-sm font-medium text-foreground hover:bg-background/60 transition disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    title="Use current location"
                  >
                    <Navigation className="h-4 w-4" />
                    <span className="hidden md:inline">{isLocating ? "Locating..." : "Current"}</span>
                  </button>

                  <div className="mx-1 h-6 w-px bg-border/70 shrink-0" />

                  <Search className="h-4 w-4 text-muted-foreground ml-1 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search city or place..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-full flex-1 min-w-0 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />

                  {searchInput.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="mr-1 inline-flex items-center justify-center rounded-full p-2 hover:bg-background/60 transition shrink-0"
                      aria-label="Clear search"
                      title="Clear"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
                aria-label="About"
                title="About"
              >
                <Info className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">About</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  )
}
