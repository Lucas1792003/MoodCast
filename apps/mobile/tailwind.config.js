/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // MoodCast brand colors
        primary: {
          DEFAULT: "#6B9C89",
          50: "#EBF4F1",
          100: "#D7E9E3",
          200: "#AFD3C7",
          300: "#87BDAB",
          400: "#6B9C89",
          500: "#5A8373",
          600: "#4A6B5E",
          700: "#3A5449",
          800: "#2A3C35",
          900: "#1A2520",
        },
        accent: {
          DEFAULT: "#E9B44C",
          50: "#FEF9EC",
          100: "#FCF3D9",
          200: "#F9E7B3",
          300: "#F6DB8D",
          400: "#F3CF67",
          500: "#E9B44C",
          600: "#D49A2A",
          700: "#A87820",
          800: "#7C5718",
          900: "#50370F",
        },
        background: "#FAFBF9",
        surface: "#FFFFFF",
        text: {
          primary: "#1A1A1A",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
