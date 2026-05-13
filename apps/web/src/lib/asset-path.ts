const prefix = process.env.NODE_ENV === "production" ? "/MoodCast" : ""
export const assetPath = (path: string) => `${prefix}${path}`
