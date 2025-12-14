import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "maplibre-gl/dist/maplibre-gl.css"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MoodCast",
  description:
    "Your weather-powered lifestyle companion. Sync your mood, fashion, activities, and wellness with the weather.",
  generator: "v0.app",

  icons: {
    icon: [
      { url: "/app_icon.png", type: "image/png" }, 
    ],
    apple: [
      { url: "/app_icon.png", type: "image/png" }, 
    ],
    shortcut: ["/app_icon.png"],
  },

  // ✅ optional but recommended if you add it
  // manifest: "/manifest.webmanifest",
}


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF5E6" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1410" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
