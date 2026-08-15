/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek dark palette with primary indigo/purple glow accents
        brand: {
          dark: '#0B0F19',
          card: '#161F30',
          border: '#23334B',
          accent: '#6366F1',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
