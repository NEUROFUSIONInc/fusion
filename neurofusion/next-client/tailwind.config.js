const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      backgroundImage: {
        "offering-pattern": "url('/images/offering-pattern.svg')",
        "stripe-pattern": "url('/images/stripe-pattern.svg')",
        "team-pattern": "url('/images/team-pattern.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-circle": "radial-gradient(ellipse at 50% 50%, #1D1539 2%, #011227 100%)",
        "dark-gradient": "linear-gradient(to bottom right, #16122E 10%, #011227 65%, #191230 100%)",
        "light-gradient":
          "linear-gradient(to bottom right, rgba(229,222,252,0.4) 0%, #ffffff 35%, #ffffff 50%, rgba(229,222,252,0.3) 100%)",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
    fontFamily: {
      body: ["var(--font-gtw-pro)", ...fontFamily.sans],
      heading: ["var(--font-gtw-pro)", ...fontFamily.sans],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      slate: colors.slate,
      indigo: {
        50: "#F6F4FF",
        100: "#EDE9FF",
        200: "#E0D9FF",
        300: "#D3C9FF",
        500: "#6366f1",
        700: "#3715D7",
        DEFAULT: "#3715D7",
      },
      aqua: "#05F2DB", // #02DEE7
      dark: "#023059", // #112F58,
      yellow: "#F9D101",
      lime: {
        100: "#EBFFD4",
        500: "#A8E457",
        700: "#73B12C",
        DEFAULT: "#A8E457",
      },
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
