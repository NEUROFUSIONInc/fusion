const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-circle": "radial-gradient(ellipse at 50% 50%, #1D1539 2%, #011227 100%)",
        "dark-gradient": "linear-gradient(to bottom right, #16122E 10%, #011227 65%, #191230 100%)",
        "light-gradient":
          "linear-gradient(to bottom right, rgba(229,222,252,0.4) 0%, #ffffff 35%, #ffffff 50%, rgba(229,222,252,0.3) 100%)",
      },
    },
    fontFamily: {
      body: ["'Inter', sans-serif", ...fontFamily.sans],
      heading: ["'Expletus Sans', cursive", ...fontFamily.sans],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      fuchsia: colors.fuchsia,
      aqua: "#05F2DB", // #02DEE7
      lime: "#A8E457", // ##B6F25C
      dark: "#023059", // #112F58,
      primary: {
        50: "#ebf3fe",
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
