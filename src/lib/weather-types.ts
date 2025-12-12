export type WeatherResult = {
  locationName: string
  temperature: number
  feelsLike: number
  weatherCode: number
  windSpeed: number
  humidity: number
  visibility: number
  latitude: number
  longitude: number
  isDay?: boolean
  sunrise?: string | null
  sunset?: string | null
}


export type GeocodeResult = {
  name: string
  country?: string
  latitude: number
  longitude: number
}
