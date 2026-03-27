/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ec4899', // rose/pink for dating app
        secondary: '#8b5cf6', // purple
      },
    },
  },
  plugins: [],
}
