import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { requestPurchase, useIAP } from "react-native-iap";

import { Screen, ChevronRightSmall } from "~/components";
import { AccountContext, OnboardingContext } from "~/contexts";
import { appInsights, connectAppleHealth } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

const subscriptionSkus = Platform.select({
  ios: ["Fusion_Premium_001"],
});

export function SettingsScreen() {
  const onboardingContext = React.useContext(OnboardingContext);
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();

  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistories,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistories,
  } = useIAP();

  const [copilotConsent, setCopilotConsent] = React.useState<boolean>(
    accountContext?.userPreferences.enableCopilot!
  );

  React.useEffect(() => {
    console.log("connected", connected);
    console.log("initConnectionError", initConnectionError);
    console.log("products", products);
    console.log("subscriptions", subscriptions);
  }, [connected]);

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
      text: "Connect with Apple Health",
      onPress: async () => {
        // call bottom sheet
        // request permissions
        await connectAppleHealth();
      },
    });
  }

  itemList.push({
    text: "Manage Subscription",
    onPress: async () => {
      try {
        // const res = await getSubscriptions({ skus: [""] });
        // console.log(res);
        const testVal = await getProducts({ skus: subscriptionSkus! });
        console.log();
        console.log("pruducts", products);

        console.log("triggering request");

        handlePurchase(products![0].productId!);
      } catch (error) {
        console.log("error", error);
      }
    },
  });

  const handlePurchase = async (sku: string) => {
    await requestPurchase({ sku });
  };

  useEffect(() => {
    // ... listen to currentPurchaseError, to check if any error happened
  }, [currentPurchaseError]);

  useEffect(() => {
    // ... listen to currentPurchase, to check if the purchase went through
  }, [currentPurchase]);

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
      </ScrollView>
    </Screen>
  );
}
