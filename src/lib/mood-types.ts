export type MoodId =
  | "energized"
  | "calm"
  | "cozy"
  | "balanced"
  | "focused"
  | "romantic"
  | "creative"
  | "chill"
  | "social"
  | "dreamy"

export type MoodConfig = {
  id: MoodId
  label: string
  emoji: string
  color: string
  accent: string // hex color for UI accents
  suggestion: string
  outfitVibe: string // passed to outfit section for AI prompt context
}

export const MOOD_CONFIGS: Record<MoodId, MoodConfig> = {
  energized: {
    id: "energized",
    label: "Energized",
    emoji: "✨",
    color: "from-accent to-yellow-400",
    accent: "#E9B44C", // golden yellow
    suggestion: "Perfect day to feel motivated and active!",
    outfitVibe: "active, sporty, vibrant colors, energetic",
  },
  calm: {
    id: "calm",
    label: "Calm",
    emoji: "🧘",
    color: "from-secondary to-blue-300",
    accent: "#6B9C89", // sage green (your accent)
    suggestion: "Great day for introspection and relaxation.",
    outfitVibe: "relaxed, soft colors, comfortable, minimal",
  },
  cozy: {
    id: "cozy",
    label: "Cozy",
    emoji: "🏠",
    color: "from-primary to-orange-400",
    accent: "#D4896A", // warm terracotta
    suggestion: "Perfect weather for indoor activities and comfort.",
    outfitVibe: "warm, layered, comfortable, soft textures",
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    emoji: "⚖️",
    color: "from-primary to-secondary",
    accent: "#7B8FA1", // slate blue-gray
    suggestion: "A great day for balanced activities.",
    outfitVibe: "versatile, smart casual, neutral tones",
  },

  // added moods 👇
  focused: {
    id: "focused",
    label: "Focused",
    emoji: "🎧",
    color: "from-blue-500 to-indigo-500",
    accent: "#4F46E5", // indigo
    suggestion: "Lock in and make progress—one task at a time.",
    outfitVibe: "clean lines, dark neutrals, functional, minimal",
  },
  romantic: {
    id: "romantic",
    label: "Romantic",
    emoji: "💗",
    color: "from-pink-400 to-rose-500",
    accent: "#EC4899", // pink
    suggestion: "Lean into softness and warmth today.",
    outfitVibe: "flowy, elegant, soft colors, gentle textures",
  },
  creative: {
    id: "creative",
    label: "Creative",
    emoji: "🎨",
    color: "from-orange-400 to-pink-500",
    accent: "#F97316", // orange
    suggestion: "Make something fun—even if it’s imperfect.",
    outfitVibe: "bold, artistic, playful layers, statement pieces",
  },
  chill: {
    id: "chill",
    label: "Chill",
    emoji: "🧊",
    color: "from-cyan-400 to-sky-500",
    accent: "#38BDF8", // sky blue
    suggestion: "No rush. Keep it light and easy.",
    outfitVibe: "oversized, comfy, casual, breathable",
  },
  social: {
    id: "social",
    label: "Social",
    emoji: "🪩",
    color: "from-purple-400 to-fuchsia-500",
    accent: "#A855F7", // purple
    suggestion: "Reach out—good vibes are better shared.",
    outfitVibe: "fun, expressive, standout pieces, trendy",
  },
  dreamy: {
    id: "dreamy",
    label: "Dreamy",
    emoji: "🌙",
    color: "from-indigo-400 to-violet-500",
    accent: "#7C3AED", // violet
    suggestion: "Let your mind wander and enjoy the mood.",
    outfitVibe: "soft fabrics, muted tones, ethereal, flowy",
  },
}

// Auto-generate so you never “stop at 5”
export const ALL_MOODS = Object.keys(MOOD_CONFIGS) as MoodId[]

// Get suggested mood based on weather
export function getSuggestedMood(weatherCode: number): MoodId {
  if (weatherCode === 0) return "energized"
  if (weatherCode >= 1 && weatherCode < 3) return "social"
  if (weatherCode >= 3 && weatherCode < 50) return "calm"
  if (weatherCode >= 50 && weatherCode < 70) return "dreamy"
  if (weatherCode >= 70) return "cozy"
  return "balanced"
}

export function getMoodConfig(moodId: MoodId): MoodConfig {
  return MOOD_CONFIGS[moodId]
}
