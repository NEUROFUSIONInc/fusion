import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Screen, ChevronRightSmall } from "~/components";
import { OnboardingContext } from "~/contexts";

export function SettingsScreen() {
  const onboardingContext = React.useContext(OnboardingContext);
  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-row w-full justify-between p-5">
          {/* move this to a component */}
          <Pressable
            className="bg-tint rounded-md w-full h-14 px-4 flex flex-row items-center justify-between active:opacity-80"
            onPress={() => {
              (async () => {
                await AsyncStorage.removeItem("onboarding_viewed");
              })();
              onboardingContext?.setShowOnboarding(true);
            }}
          >
            <View className="flex flex-row items-center gap-x-2">
              <Text className="font-sans text-base text-white">
                Show Onboarding
              </Text>
            </View>
            <ChevronRightSmall />
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
