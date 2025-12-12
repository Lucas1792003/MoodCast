"use client"
import { X, Cloud, Shirt, Activity, Heart, Eye } from "lucide-react"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">About MoodCast</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* What is MoodCast */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">What is MoodCast?</h3>
            <p className="text-foreground/80 leading-relaxed">
              MoodCast is your personal lifestyle weather companion. It goes beyond traditional weather forecasting by
              connecting real-time weather data to your mood, fashion choices, activities, and health recommendations.
              Never be caught off-guard by the weather again—MoodCast helps you align your day with nature's moods.
            </p>
          </section>

          {/* Key Features */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Key Features</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Real-Time Weather Data</h4>
                  <p className="text-sm text-foreground/70">
                    Get accurate, up-to-date weather information for any location worldwide using advanced
                    meteorological APIs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Mood Insights</h4>
                  <p className="text-sm text-foreground/70">
                    Discover how different weather conditions affect your emotional well-being and receive mood
                    recommendations tailored to the current climate.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shirt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Smart Outfit Suggestions</h4>
                  <p className="text-sm text-foreground/70">
                    Get personalized clothing recommendations based on temperature, precipitation, and wind conditions
                    to stay comfortable all day.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Activity Recommendations</h4>
                  <p className="text-sm text-foreground/70">
                    Find the perfect activities and exercises suited to today's weather. Whether it's sunny or rainy, we
                    have suggestions for you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Health & Wellness Tips</h4>
                  <p className="text-sm text-foreground/70">
                    Get personalized health advice including hydration, sun protection, and comfort tips based on
                    current weather conditions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">AR Sky Viewer</h4>
                  <p className="text-sm text-foreground/70">
                    Experience an interactive visualization of the current sky conditions with our immersive AR sky
                    viewer.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">How to Use MoodCast</h3>
            <ol className="space-y-3 text-foreground/80">
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">1.</span>
                <span>
                  <strong>Allow Location Access:</strong> Grant permission to use your current location, or manually
                  search for any city worldwide.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">2.</span>
                <span>
                  <strong>View Weather Overview:</strong> See the current temperature, humidity, wind speed, and
                  visibility at a glance with beautiful visualizations.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">3.</span>
                <span>
                  <strong>Check Your Mood:</strong> Understand how today's weather might affect your emotions and get
                  suggestions to enhance your mood.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">4.</span>
                <span>
                  <strong>Get Outfit Suggestions:</strong> Browse recommended outfits specifically suited for today's
                  weather and temperature.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">5.</span>
                <span>
                  <strong>Discover Activities:</strong> Find activities and exercises that match the current weather
                  conditions for maximum enjoyment.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">6.</span>
                <span>
                  <strong>Follow Health Tips:</strong> Get personalized health and wellness recommendations to stay safe
                  and comfortable throughout the day.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0 w-6">7.</span>
                <span>
                  <strong>Explore the Sky:</strong> Try our interactive AR sky viewer to visualize current atmospheric
                  conditions.
                </span>
              </li>
            </ol>
          </section>

          {/* Tips */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">Pro Tips</h3>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>
                  Update your location frequently to get the most accurate recommendations as weather changes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>
                  Pay attention to the health section—it provides critical information like UV index and hydration
                  needs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Check MoodCast before planning outdoor activities to make the most of your day.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Use outfit suggestions as inspiration—customize them based on your personal style!</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
