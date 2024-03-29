/* do not change this file, it is auto generated by storybook. */

import {
  configure,
  addDecorator,
  addParameters,
  addArgsEnhancer,
  clearDecorators,
} from "@storybook/react-native";

global.STORIES = [
  {
    titlePrefix: "",
    directory: "./src/components",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:src\\/components(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
  {
    titlePrefix: "",
    directory: "./src/screens",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:src\\/screens(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
  {
    titlePrefix: "",
    directory: "./src/navigation",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:src\\/navigation(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
];

import "@storybook/addon-ondevice-controls/register";
import "@storybook/addon-ondevice-actions/register";
import "@storybook/addon-ondevice-backgrounds/register";

import { argsEnhancers } from "@storybook/addon-actions/dist/modern/preset/addArgs";

import { decorators, parameters } from "./preview";

if (decorators) {
  if (__DEV__) {
    // stops the warning from showing on every HMR
    require("react-native").LogBox.ignoreLogs([
      "`clearDecorators` is deprecated and will be removed in Storybook 7.0",
    ]);
  }
  // workaround for global decorators getting infinitely applied on HMR, see https://github.com/storybookjs/react-native/issues/185
  clearDecorators();
  decorators.forEach((decorator) => addDecorator(decorator));
}

if (parameters) {
  addParameters(parameters);
}

try {
  argsEnhancers.forEach((enhancer) => addArgsEnhancer(enhancer));
} catch {}

const getStories = () => {
  return {
    "./src/components/button/button.stories.tsx": require("../src/components/button/button.stories.tsx"),
    "./src/components/day-chip/day-chip.stories.tsx": require("../src/components/day-chip/day-chip.stories.tsx"),
    "./src/components/input/input.stories.tsx": require("../src/components/input/input.stories.tsx"),
    "./src/components/logo/logo.stories.tsx": require("../src/components/logo/logo.stories.tsx"),
    "./src/components/option/option.stories.tsx": require("../src/components/option/option.stories.tsx"),
    "./src/components/select/select.stories.tsx": require("../src/components/select/select.stories.tsx"),
    "./src/components/tag/tag.stories.tsx": require("../src/components/tag/tag.stories.tsx"),
    "./src/components/timepicker/timepicker.stories.tsx": require("../src/components/timepicker/timepicker.stories.tsx"),
    "./src/navigation/navigation.stories.tsx": require("../src/navigation/navigation.stories.tsx"),
  };
};

configure(getStories, module, false);
