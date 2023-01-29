const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", fontFamily.sans],
        heading: ["var(--font-heading)", fontFamily.sans],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-circle": "radial-gradient(ellipse at 50% 50%, #1D1539 2%, #011227 100%)",
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      aqua: "#05F2DB", // #02DEE7
      lime: "#A8E457", // ##B6F25C
      dark: "#023059", // #112F58,
      primary: {
        100: "#cde2fc",
        200: "#9cc5fa",
        300: "#6aa7f7",
        400: "#398af5",
        500: "#076df2",
        600: "#0657c2",
        700: "#044191",
        800: "#032c61",
        900: "#011227",
        DEFAULT: "#076df2",
      },
      secondary: {
        100: "#e5defc",
        200: "#cbbefa",
        300: "#b19df7",
        400: "#977df5",
        500: "#7d5cf2",
        600: "#644ac2",
        700: "#4b3791",
        800: "#322561",
        900: "#191230",
        DEFAULT: "#644ac2",
      },
    },
  },
  container: {
    center: true,
  },
  plugins: [],
};
