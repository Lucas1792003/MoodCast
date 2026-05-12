export type PlaceRef = {
  id: string
  name: string
  category:
    | "dessert"
    | "cafe"
    | "food"
    | "park"
    | "museum"
    | "mall"
    | "cinema"
    | "gym"
    | "photo"
    | "market"
    | "other"
  lat: number
  lon: number
  distanceM: number
  address?: string
  osmUrl?: string
}

export type ApiOut = {
  weatherUsed: { code: number; isDay: boolean; temp: number }
  kind: string
  primary: { headline: string; message: string; place?: PlaceRef }
  secondary: { headline: string; message: string; place?: PlaceRef }[]
}

export type TravelMeta = {
  distanceM?: number
  durationS?: number
}

export type Mode = "walk" | "bike" | "drive"

export type WeatherInfo = {
  code: number
  isDay: boolean
  temp: number
}

export const SUBTITLE_VARIANTS: Record<string, string[]> = {
  food: ["Tasty spot worth the detour", "Great bite for a quick break", "Good place to eat and chill", "Perfect for hanging out"],
  cafe: ["Cozy cafe to relax", "Nice coffee stop nearby", "Quiet spot to recharge", "Great place to work a bit"],
  dessert: ["Sweet treat nearby", "Dessert that hits the spot", "Sugar break time 🍰", "A little reward walk"],
  park: ["Fresh air and a chill stroll", "Nice place to unwind", "Good for a short walk", "Relaxing outdoor break"],
  museum: ["Quick culture break nearby", "Interesting place to explore", "Small adventure close by", "Worth a look if you have time"],
  mall: ["Browse, shop, and cool down", "Good place to wander", "Quick indoor escape", "Shopping + snacks time"],
  cinema: ["Movie time nearby", "Chill with a film", "Good evening plan", "Quick entertainment break"],
  gym: ["Quick workout spot", "Good place to move", "Short training session?", "Get a sweat in nearby"],
  market: ["Local finds and snacks", "Good place to browse", "Street vibes + food", "Explore local goodies"],
  photo: ["Nice spot for photos", "Good views nearby", "Cool place to capture", "Quick photo walk"],
  other: ["Nice spot nearby", "Worth checking out", "Quick stop if you're close", "Something fun nearby"],
}
