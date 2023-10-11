import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Screen, ChevronRightSmall } from "~/components";
import { AccountContext, OnboardingContext } from "~/contexts";
import { appInsights, connectAppleHealth } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

export function SettingsScreen() {
  const onboardingContext = React.useContext(OnboardingContext);
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();

  const [copilotConsent, setCopilotConsent] = React.useState<boolean>(
    accountContext?.userPreferences.enableCopilot!
  );
  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Settings",
      properties: {},
    });
  }, []);

  const itemList = [
    {
      text: "Show Onboarding",
      onPress: async () => {
        await AsyncStorage.removeItem("onboarding_viewed");
        onboardingContext?.setShowOnboarding(true);
      },
    },
    {
      text: copilotConsent ? "Disable Copilot" : "Enable Copilot",
      onPress: async () => {
        // call bottom sheet
        const consentStatus = await requestCopilotConsent(
          accountContext!.userNpub
        );
        setCopilotConsent(consentStatus);
        accountContext?.setUserPreferences({
          ...accountContext.userPreferences,
          enableCopilot: consentStatus,
        });
        navigation.navigate("HomePage");
      },
    },
  ];

  if (Platform.OS === "ios") {
    itemList.push({
      text: "Connect with Apple Health",
      onPress: async () => {
        // call bottom sheet
        // request permissions
        await connectAppleHealth();
      },
    });
  }
  // {
  //   text: "Manage Subscription",
  //   onPress: () => {
  //     // direct user to fusion website with login page
  //   },
  // },

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
