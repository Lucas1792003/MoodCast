"use client"

import type React from "react"
import { useState } from "react"
import { Search, Cloud } from "lucide-react"
import AboutModal from "./about-modal"

interface HeaderProps {
  onSearch: (location: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchInput, setSearchInput] = useState("")
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = searchInput.trim()
    if (!value) return
    onSearch(value)
  }

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">MoodCast</h1>
                <p className="text-xs text-muted-foreground">
                  Weather-powered outfits & vibes
                </p>
              </div>
            </div>

            {/* Search bar */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex items-center max-w-md"
            >
              <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 w-full border border-border focus-within:ring-2 focus-within:ring-primary/40">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search city or place..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
                />
              </div>
            </form>

            {/* About button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition"
              >
                About
              </button>
            </div>
          </div>
        </div>
      </header>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  )
}
