import { PortalProvider } from "@gorhom/portal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Logs } from "expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { withIAPContext } from "react-native-iap";
import Toast from "react-native-toast-message";

import { FontLoader } from "./FontLoader";
import { CustomNavigation } from "./src/navigation";
import { appInsights, maskPromptId } from "./src/utils";

import { QUERY_OPTIONS_DEFAULT } from "~/config";
import {
  PromptContextProvider,
  AccountContext,
  OnboardingContext,
} from "~/contexts";
import { OnboardingScreen } from "~/pages/onboarding";
import { notificationService, promptService } from "~/services";
import { toastConfig } from "~/theme";

Logs.enableExpoCliLogging();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

// - temp remove since asking for notification permission on first load causes hiding splash screen to fail
// SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: QUERY_OPTIONS_DEFAULT,
});

function App() {
  const responseListener = React.useRef<
    Notifications.Subscription | undefined
  >();
  const navigation = useNavigation<any>();
  const accountContext = React.useContext(AccountContext);
  const onboardingContext = React.useContext(OnboardingContext);

  React.useEffect(() => {
    // validate permission status for user
    (async () => {
      await notificationService.registerForPushNotificationsAsync();
      await notificationService.setUpNotificationCategories();

      // set notification handlers
      // what happens when a user responds to notification
      // even in background
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            // remove notification from tray
            Notifications.dismissNotificationAsync(
              response.notification.request.identifier
            );
            const promptUuid =
              await notificationService.getPromptForNotificationId(
                response.notification.request.identifier
              );
            if (!promptUuid) {
              console.log("unable to fetch prompt uuid for notification id");
              return;
            }
            // dismiss all other notifications for this prompt
            const notificationIds =
              await notificationService.getNotificationIdsForPrompt(promptUuid);
            if (notificationIds) {
              await Promise.all(
                notificationIds.map((id) =>
                  Notifications.dismissNotificationAsync(id)
                )
              );
            }
            if (
              response.actionIdentifier ===
              Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
              // TODO: fix bug that doesn't let this load when the home page stack is the first one
              navigation.navigate("PromptNavigator", {
                screen: "PromptEntry",
                params: {
                  promptUuid,
                  triggerTimestamp: Math.floor(response.notification.date),
                },
              });
              return;
            }
            // get response from notification
            let response_value: string | undefined;
            let notificationCategory: string | null = "";
            if ("categoryIdentifier" in response.notification.request.content) {
              notificationCategory =
                response.notification.request.content.categoryIdentifier;
            }
            if (
              notificationCategory === "yesno" ||
              notificationCategory?.endsWith("customOptions")
            ) {
              response_value = response.actionIdentifier;
            } else if (
              notificationCategory === "text" ||
              notificationCategory === "number"
            ) {
              response_value = response.userText;
            }
            // create prompt object
            const promptResponse = {
              promptUuid, // ensure promptUuid is always of type string
              triggerTimestamp: Math.floor(response.notification.date),
              responseTimestamp: Math.floor(dayjs().unix()),
              value: response_value ?? "",
            };
            // save the prompt response
            await promptService.savePromptResponse(promptResponse);
            // track event
            appInsights.trackEvent(
              {
                name: "prompt_response",
              },
              {
                identifier: await maskPromptId(promptUuid || ""),
                triggerTimestamp: promptResponse.triggerTimestamp,
                responseTimestamp: promptResponse.responseTimestamp,
                userNpub: accountContext?.userNpub,
              }
            );
          }
        );

      const notificationResetStatus = await AsyncStorage.getItem(
        "notification_reset_aug_16"
      );
      if (notificationResetStatus !== "true") {
        console.log("Resetting all device notifications");
        await promptService.resetNotificationsForActivePrompts();
        await AsyncStorage.setItem("notification_reset_aug_16", "true");
      }
    })();
  }, []);

  React.useEffect(() => {
    appInsights.trackEvent(
      { name: "app_started" },
      {
        userNpub: accountContext?.userNpub,
      }
    );
  }, []);

  return (
    <GestureHandlerRootView className="flex flex-1 flex-grow-1">
      <FontLoader>
        <StatusBar barStyle="light-content" />
        <QueryClientProvider client={queryClient}>
          <PromptContextProvider>
            <PortalProvider>
              {onboardingContext?.showOnboarding && <OnboardingScreen />}
              {!onboardingContext?.showOnboarding && <CustomNavigation />}
            </PortalProvider>
          </PromptContextProvider>
        </QueryClientProvider>
      </FontLoader>
      <Toast config={toastConfig} position="bottom" />
    </GestureHandlerRootView>
  );
}

let AppEntryPoint = withIAPContext(App);

if (Constants.expoConfig?.extra?.storybookEnabled === "true") {
  AppEntryPoint = require("./.storybook").default;
}

export default AppEntryPoint;
