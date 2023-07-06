import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { Screen } from "../components";

import { appInsights } from "~/utils";

export function HomeScreen() {
  const navigation = useNavigation();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {},
    });
  }, []);

  return (
    <Screen>
      <View />
    </Screen>
  );
}
