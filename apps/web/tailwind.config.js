/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'chess-dark': '#312e2b',
        'chess-light': '#b7c0d8',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
