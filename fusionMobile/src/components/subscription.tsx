import RNBottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import React, { FC, RefObject, useMemo, useEffect } from "react";
import { View, Text, Platform, Linking, Alert } from "react-native";
import { requestPurchase, useIAP } from "react-native-iap";

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
      finishTransaction({ purchase: currentPurchase });

      if (currentPurchase.productId === subscriptionSkus![0]) {
        setUserSubscribed(true);
      }
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
          You can use Fusion for free forever, but you'll be missing out on some
          cool features.
          {"\n\n"}
          With Fusion Premium, you can connect your health data and get
          intelligent recommendations & summaries from our Copilot.
          {"\n\n"}
          You also get first dibs on what we're building next like editing &
          sharing responses, connecting music & screentime, quests & much more!{" "}
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
            <Button
              title="Get Fusion Premium"
              fullWidth
              onPress={async () => await handlePurchase()}
            />
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
