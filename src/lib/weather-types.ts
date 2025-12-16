export type HourlyForecastItem = {
  time: string
  temperature: number
  weatherCode: number
  precipitationProbability?: number | null
  windSpeed?: number | null
}

export type DailyForecastItem = {
  date: string
  tempMax: number
  tempMin: number
  weatherCode: number
  precipitationProbabilityMax?: number | null
}

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

  uvIndex?: number | null
  cloudCover?: number | null
  pressureMsl?: number | null
  surfacePressure?: number | null
  dewPoint?: number | null

  precipitationProbability?: number | null
  precipitation?: number | null
  rain?: number | null
  showers?: number | null
  snowfall?: number | null

  windGusts?: number | null
  windDirection?: number | null

  hourlyForecast?: HourlyForecastItem[] | null
  dailyForecast?: DailyForecastItem[] | null
}

export type GeocodeResult = {
  name: string
  country?: string
  latitude: number
  longitude: number
}
