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
        yt: {
          red: '#FF0000',
          dark: '#0f0f0f',
          darker: '#080808',
          card: '#181818',
          hover: '#272727',
          border: '#303030',
          text: '#f1f1f1',
          muted: '#aaaaaa',
          chip: '#272727',
          'chip-active': '#f1f1f1'
        }
      }
    },
  },
  plugins: [],
}
