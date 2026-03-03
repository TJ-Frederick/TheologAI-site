/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#d4a843',
          500: '#c9952c',
          600: '#b8841f',
        },
      },
    },
  },
  plugins: [],
};
