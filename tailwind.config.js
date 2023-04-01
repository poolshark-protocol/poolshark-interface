/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#227BED",
        background: "#06172D",
        grey: "#646464",
        grey1: "#1E1E1E",
        grey2: '#313131',
        dark: "#0C0C0C",
      },
      fontFamily: {
        'Satoshi': ['Satoshi']
      },
    },
  },
  plugins: [],
};
