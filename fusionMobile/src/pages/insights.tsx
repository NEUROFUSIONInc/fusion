import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Image } from "react-native";

import { Screen } from "../components";

import { appInsights } from "~/utils";

export function InsightsScreen() {
  const navigation = useNavigation();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Insights",
      properties: {},
    });
  }, []);

  return (
    <Screen>
      <View className="flex flex-1 flex-col gap-7 items-center justify-center">
        <Image source={require("../../assets/pie-chart.png")} />
        <Text className="font-sans-light max-w-xs text-center text-white text-base">
          Hello there, looks like you haven’t logged enough data to track
        </Text>
      </View>
    </Screen>
  );
}
