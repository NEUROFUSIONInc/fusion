import * as path from "path";

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-tailwind-dark-mode",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: path.resolve(__dirname, "../next.config.js"),
    },
  },
  staticDirs: [
    {
      from: "../public",
      to: "public",
    },
    {
      from: "../public/images",
      to: "images",
    },
  ],
  docs: {
    autodocs: true,
  },
};
