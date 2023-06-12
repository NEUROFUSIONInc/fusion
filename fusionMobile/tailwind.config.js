const colors = require("./src/theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors,
    fontFamily: {
      "sans-light": ["wsh-light"],
      sans: ["wsh-reg"],
      "sans-medium": ["wsh-med"],
      "sans-semibold": ["wsh-semi"],
      "sans-bold": ["wsh-bold"],
      "sans-black": ["wsh-xbold"],
    },
  },
  plugins: [],
};
