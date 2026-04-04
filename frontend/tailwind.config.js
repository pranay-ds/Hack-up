/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        panelBg: "#1A2035",
        accentRed: "#F6465D",
        accentGreen: "#0ECB81",
        accentBlue: "#3B82F6",
      }
    },
  },
  plugins: [],
}
