const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0B0816",
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      slate: colors.slate,
      rose: "#CD668D",
      aqua: "#01E9E9",
      lime: "#A7ED58",
      dark: "#0B0816",
      primary: {
        100: "#d4e0ff",
        200: "#a9c1ff",
        300: "#7ea2ff",
        400: "#5383ff",
        500: "#2864ff",
        600: "#2050cc",
        700: "#183c99",
        800: "#102866",
        900: "#181230",
        DEFAULT: "#2864ff",
      },
      secondary: {
        100: "#e0dbf3",
        200: "#D3C9FF",
        300: "#a292da",
        400: "#836ece",
        500: "#6249D8",
        600: "#503b9b",
        700: "#3c2c74",
        800: "#23212D",
        900: "#171522", //"#140f27"
        DEFAULT: "#6249D8",
      },
    },
  },
  plugins: [],
};
