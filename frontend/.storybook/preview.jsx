import { ThemeProvider } from "next-themes";
import { ThemeChanger } from "../src/utils/themeChanger";
import { gtw } from "../src/utils/font-loader";
import "../src/styles/globals.css";

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "system",
    toolbar: {
      items: ["light", "dark", "system"],
      showName: true,
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, { globals }) => (
    <ThemeProvider attribute="class" enableSystem>
      <ThemeChanger theme={globals.theme ? globals.theme : "system"} />
      <main className={`${gtw.variable} font-body`}>
        <Story />
      </main>
    </ThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
