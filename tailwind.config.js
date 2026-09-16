/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#86efac',
          light: '#a7f3d0',
          dark: '#4ade80',
        },
        secondary: '#888888',
        page: '#000000',
        dark: {
          bg: '#000000',
          card: 'rgba(10, 10, 10, 0.8)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
