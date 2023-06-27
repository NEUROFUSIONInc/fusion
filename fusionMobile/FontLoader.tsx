import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { PropsWithChildren, useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends PropsWithChildren {
  onFontsLoaded?: () => void; // callback for displaying the splash screen once background view has loaded
}

export const FontLoader = ({ onFontsLoaded, children }: Props) => {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    "wsh-thin": require("./assets/fonts/GTWalsheimPro-Thin.ttf"),
    "wsh-light": require("./assets/fonts/GTWalsheimPro-Light.ttf"),
    "wsh-reg": require("./assets/fonts/GTWalsheimPro-Regular.ttf"),
    "wsh-med": require("./assets/fonts/GTWalsheimPro-Medium.ttf"),
    "wsh-semi": require("./assets/fonts/GTWalsheimPro-Bold.ttf"),
    "wsh-bold": require("./assets/fonts/GTWalsheimPro-Black.ttf"),
    "wsh-xbold": require("./assets/fonts/GTWalsheimPro-UltraBold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    // if (fontsLoaded) {
    //   await SplashScreen.hideAsync(); //hide the splashscreen
    // }
  }, [fontsLoaded, onFontsLoaded]);

  if (!fontsLoaded) {
    return <View />;
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
      onLayout={onLayoutRootView}
    >
      {children}
    </View>
  );
};
