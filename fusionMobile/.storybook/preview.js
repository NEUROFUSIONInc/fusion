import React from "react";
import { View, StyleSheet, Appearance } from "react-native";
import { withBackgrounds } from "@storybook/addon-ondevice-backgrounds";

import { FontLoader } from "../FontLoader.tsx";

export const decorators = [
  (StoryFn) => (
    <FontLoader>
      <View style={styles.container}>
        <StoryFn />
      </View>
    </FontLoader>
  ),
  withBackgrounds,
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  my_param: "anything",
  backgrounds: {
    default: Appearance.getColorScheme() === "dark" ? "dark" : "plain",
    values: [
      { name: "plain", value: "white" },
      { name: "dark", value: "#333" },
      { name: "app", value: "#eeeeee" },
    ],
  },
};

const styles = StyleSheet.create({
  container: { padding: 8, flex: 1 },
});
