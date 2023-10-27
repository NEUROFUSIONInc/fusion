import RNBottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import React, { FC, RefObject, useMemo, useEffect } from "react";
import { View, Text, Platform, Linking, Alert } from "react-native";
import {
  getAvailablePurchases,
  requestPurchase,
  useIAP,
} from "react-native-iap";

import { BottomSheet } from "~/components/bottom-sheet";
import { Button } from "~/components/button";
import { AccountContext } from "~/contexts";
import { appInsights } from "~/utils";

interface SubscriptionSheetProps {
  subscriptionSheetRef: RefObject<RNBottomSheet>;
  onBottomSheetClose: () => void;
}
const subscriptionSkus = Platform.select({
  ios: ["fusion.premium.monthly"],
});

export const SubscriptionSheet: FC<SubscriptionSheetProps> = ({
  subscriptionSheetRef,
  onBottomSheetClose,
}) => {
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const accountContext = React.useContext(AccountContext);

  const {
    connected,
    products,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getSubscriptions,
  } = useIAP();

  React.useEffect(() => {
    if (initConnectionError) {
      console.log("error", initConnectionError);
    }
    (async () => {
      await getSubscriptions({ skus: subscriptionSkus! });
    })();
  }, [connected, initConnectionError]);

  const handlePurchase = async () => {
    if (!products) {
      appInsights.trackEvent({
        name: "subscription_error",
        properties: {
          userNpub: accountContext?.userNpub,
          error: "No products found",
        },
      });
      Alert.alert(
        "Subscription Error",
        "We ran into an error. This has will be reported and working to fix this"
      );
      return;
    }
    try {
      await requestPurchase({ sku: subscriptionSkus![0] });
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const purchases = await getAvailablePurchases();
      // Handle the restored purchases (e.g., unlock premium features)
      console.log("Restored Purchases:", purchases);

      await Promise.all(
        purchases.map(async (purchase) => {
          switch (purchase.productId) {
            case "fusion.premium.monthly":
              await finishTransaction({ purchase });
              setUserSubscribed(true);
              appInsights.trackEvent({
                name: "subscription_restored",
                properties: {
                  userNpub: accountContext?.userNpub,
                  purchase,
                },
              });
              break;
          }
        })
      );
    } catch (error) {
      console.error("Failed to restore purchases:", error);
    }
  };

  useEffect(() => {
    // ... listen to currentPurchaseError, to check if any error happened
    if (currentPurchaseError) {
      appInsights.trackEvent({
        name: "subscription_error",
        properties: {
          userNpub: accountContext?.userNpub,
          error: currentPurchaseError,
        },
      });
      // console.log("Error Occured Completing Purchase", currentPurchaseError);
    }
  }, [currentPurchaseError]);

  useEffect(() => {
    // ... listen to currentPurchase, to check if the purchase went through
    if (currentPurchase) {
      console.log("currentPurchase", currentPurchase);
      (async () => {
        await finishTransaction({ purchase: currentPurchase });

        if (currentPurchase.productId === subscriptionSkus![0]) {
          setUserSubscribed(true);
        }
      })();
    }

    appInsights.trackEvent({
      name: "subscription_validation",
      properties: {
        userNpub: accountContext?.userNpub,
        purchase: currentPurchase,
      },
    });
  }, [currentPurchase]);

  const [userSubscribed, setUserSubscribed] = React.useState(false);
  return (
    <BottomSheet
      ref={subscriptionSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5"
        onLayout={handleContentLayout}
      >
        <Text className="font-sans text-base text-white ">
          Fusion Premium gives you access Fusion Copilot with personalized
          recommendations on how to navigate your day based on your responses.
          {"\n\n"}In future releases, you'd be able to:{"\n"}- Edit responses
          and share custom reports.{"\n"}- Pair Fusion with your sleep, activity
          trackers, music listening history and screen time.
        </Text>

        <View className="flex">
          {userSubscribed ? (
            <Button
              title="Unsubscribe"
              fullWidth
              onPress={() => {
                if (Platform.OS === "ios") {
                  Linking.openURL(
                    "https://apps.apple.com/account/subscriptions"
                  );
                } else {
                  Linking.openURL(
                    "https://play.google.com/store/account/subscriptions"
                  );
                }
              }}
            />
          ) : (
            <>
              <View>
                <Button
                  title="Get Fusion Premium"
                  fullWidth
                  onPress={async () => await handlePurchase()}
                />
                <Text className="font-sans text-base text-white text-center">
                  3 days free, then $9.99/month
                </Text>
              </View>

              <Button
                title="Restore Purchase"
                fullWidth
                onPress={async () => {
                  await handleRestorePurchases();
                }}
                variant="ghost"
                className="mt-5"
              />

              <View className="flex flex-row justify-around">
                <Button
                  title="Privacy Policy"
                  variant="ghost"
                  onPress={async () =>
                    await Linking.openURL(
                      "http://www.apple.com/legal/itunes/appstore/dev/stdeula"
                    )
                  }
                />
                <Button
                  title="Terms of Service"
                  variant="ghost"
                  onPress={async () =>
                    await Linking.openURL("https://usefusion.app/privacy")
                  }
                />
              </View>
              <Text className="font-sans text-white text-xs text-center">
                Payment will be charged to your credit card through your iTunes
                account at confirmation of purchase. Subscription renews
                automatically unless canceled at least 24 hrs prior to the end
                of the subscription period. You can turn off auto-renew at any
                time from your iTunes account settings but refunds will not be
                provided for any unused portion.
              </Text>
            </>
          )}
          <Button
            title="Close"
            fullWidth
            onPress={onBottomSheetClose}
            variant="ghost"
          />
        </View>
      </View>
    </BottomSheet>
  );
};
