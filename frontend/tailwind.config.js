/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          dark: '#E85A5A',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          dark: '#45B7AF',
        },
      },
    },
  },
  plugins: [],
}
