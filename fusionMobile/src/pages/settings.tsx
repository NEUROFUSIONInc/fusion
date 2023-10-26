import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import React, { useCallback } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Screen, ChevronRightSmall, SubscriptionSheet } from "~/components";
import { AccountContext, OnboardingContext } from "~/contexts";
import { appInsights, connectAppleHealth } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

export function SettingsScreen() {
  const onboardingContext = React.useContext(OnboardingContext);
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();
  const subscriptionSheetRef = React.useRef<RNBottomSheet>(null);

  const [copilotConsent, setCopilotConsent] = React.useState<boolean>(
    accountContext?.userPreferences.enableCopilot!
  );

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Settings",
      properties: {
        userNpub: accountContext?.userNpub,
      },
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
      text: "Connect your sleep & health data",
      onPress: async () => {
        // call bottom sheet
        // request permissions
        await connectAppleHealth();
      },
    });
    itemList.push({
      text: "Manage Subscription",
      onPress: async () => {
        console.log("display subscription sheet");
        setShowSubscriptionSheet(true);
        subscriptionSheetRef.current?.expand();
      },
    });
  }

  const [showSubscriptionSheet, setShowSubscriptionSheet] =
    React.useState<boolean>(false);

  const handleSubscriptionSheetClose = useCallback(() => {
    subscriptionSheetRef.current?.close();
  }, []);

  const renderSubscriptionSheet = () => {
    return (
      <Portal>
        <SubscriptionSheet
          subscriptionSheetRef={subscriptionSheetRef}
          onBottomSheetClose={handleSubscriptionSheetClose}
        />
      </Portal>
    );
  };
  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-col w-full justify-between p-5">
          {/* move this to a component */}
          {itemList.map((item) => {
            return (
              <Pressable
                key={Math.random()}
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
        {renderSubscriptionSheet()}

        <Text className="font-sans text-base text-white text-center">
          Fusion v.{Constants.expoConfig?.version}
        </Text>
      </ScrollView>
    </Screen>
  );
}
