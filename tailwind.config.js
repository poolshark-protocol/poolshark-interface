/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#022F88",
        main1: "#000A2C",
        main2: "#227BED",
        background: "#06172D",
        grey: "#2C2E33",
        grey1: "#646364",
        grey2: '#494949',
        grey3: "#5F5F5F",
        dark: "#0C0C0C",
      },
    },
  },
  plugins: [],
};
