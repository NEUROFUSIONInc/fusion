import localFont from "next/font/local";

export const gtw = localFont({
  src: [
    {
      path: "../../public/fonts/GTWalsheimPro-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-Black.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/GTWalsheimPro-UltraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-gtw-pro",
});
