import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

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
      <View className="flex flex-row w-full justify-between p-5">
        <Text className="text-base font-sans-bold text-white">This week</Text>
        <Text className="text-base font-sans text-[#A7ED58]">
          View all stats
        </Text>
      </View>
    </Screen>
  );
}
