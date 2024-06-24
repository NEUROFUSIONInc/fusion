import React from "react";
import { View, Text } from "react-native";

import { Screen } from "~/components";

export const CommunityScreen = () => {
  return (
    <Screen>
      <View className="h-50 bg-secondary-900" />

      <View className="">
        <View className="flex flex-row w-full justify-between p-5">
          <Text className="text-base font-sans-bold text-white">
            Achievements
          </Text>
        </View>

        <View className="flex flex-col w-full bg-secondary-900 rounded">
          <Text className="text-base font-sans text-white p-5" />
        </View>
      </View>
      {/* View for streaks */}

      {/* Button to join the community on discord */}

      {/* Share your prompt responses with someone else? */}
    </Screen>
  );
};
