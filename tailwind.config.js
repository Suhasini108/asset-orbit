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
        forest: {
          DEFAULT: '#315F50',
          dark: '#244B3E',
          deep: '#1D3B31',
          light: '#3D7563'
        },
        sage: {
          DEFAULT: '#A9C7B5',
          light: '#E6EFE8',
          pale: '#F2F7F4',
          dark: '#7A9E88'
        },
        orbit: {
          bg: '#F7F8F5',
          card: '#FFFFFF',
          text: '#172D27',
          muted: '#718078',
          border: '#E5EAE5',
          peach: '#F9EBDD'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
