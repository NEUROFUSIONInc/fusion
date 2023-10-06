import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Screen, ChevronRightSmall } from "~/components";
import { AccountContext, OnboardingContext } from "~/contexts";
import { appInsights } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

export function SettingsScreen() {
  const onboardingContext = React.useContext(OnboardingContext);
  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Settings",
      properties: {},
    });

    (async () => {
      const consent = await SecureStore.getItemAsync("copilot_consent");
      if (consent === "true") {
        setCopilotConsent(true);
      } else {
        setCopilotConsent(false);
      }
    })();
  }, []);

  const [copilotConsent, setCopilotConsent] = React.useState<boolean>(false);

  const itemList = [
    {
      text: "Show Onboarding",
      onPress: async () => {
        await AsyncStorage.removeItem("onboarding_viewed");
        onboardingContext?.setShowOnboarding(true);
      },
    },
    {
      text: copilotConsent ? "Enable Copilot" : "Disable Copilot",
      onPress: async () => {
        // call bottom sheet
        await requestCopilotConsent(accountContext!.userNpub);
      },
    },
    // {
    //   text: "Manage Subscription",
    //   onPress: () => {
    //     // direct user to fusion website with login page
    //   },
    // },
  ];
  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-col w-full justify-between p-5">
          {/* move this to a component */}
          {itemList.map((item) => {
            return (
              <Pressable
                className="bg-secondary-900 rounded-md w-full h-14 px-4 flex flex-row items-center justify-between mb-5"
                onPress={item.onPress}
              >
                <View className="flex flex-row items-center gap-x-2">
                  <Text className="font-sans text-base text-white">
                    {item.text}
                  </Text>
                </View>
                <ChevronRightSmall />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
