/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d1a',
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a3060',
        },
        electric: {
          500: '#1E90FF',
          400: '#4dabff',
          300: '#80c3ff',
        },
        sky: {
          400: '#38bdf8',
        }
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(30,144,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,144,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
