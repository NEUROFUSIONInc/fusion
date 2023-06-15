import React from "react";
import { View, StyleSheet, Appearance, SafeAreaView } from "react-native";
import { withBackgrounds } from "@storybook/addon-ondevice-backgrounds";

import { FontLoader } from "../FontLoader.tsx";

export const decorators = [
  (StoryFn) => (
    <FontLoader>
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          <StoryFn />
        </View>
      </SafeAreaView>
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
  root: { flex: 1, backgroundColor: "#0B0816", height: "100%", width: "100%" },
  container: { padding: 8, flex: 1 },
});
