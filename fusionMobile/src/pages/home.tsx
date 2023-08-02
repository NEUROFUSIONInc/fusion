import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

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
    <View>
      {/* <>
          <View className="flex flex-row w-full justify-between p-5">
            <Text className="text-base font-sans-bold text-white">
              Your health data
            </Text>
            <Text className="text-base font-sans text-lime">Show all</Text>
          </View>

          <Button
            title="Connect to Apple Health"
            onPress={() => console.log("connect to apple health")}
            className="w-full p-5"
            size="md"
          />
        </> */}
    </View>
  );
}
