// .storybook/main.js
module.exports = {
  stories: [
    "../src/components/**/*.stories.?(ts|tsx|js|jsx)",
    "../src/screens/**/*.stories.?(ts|tsx|js|jsx)",
    "../src/navigation/**/*.stories.?(ts|tsx|js|jsx)",
  ],
  addons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
    "@storybook/addon-ondevice-backgrounds",
  ],
  framework: "@storybook/react-native",
};
