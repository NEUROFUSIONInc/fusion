import { PortalProvider } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Logs } from "expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React from "react";
import { Alert, Linking, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { withIAPContext } from "react-native-iap";
import Toast from "react-native-toast-message";
import VersionCheck from "react-native-version-check";

import { FontLoader } from "./FontLoader";
import { CustomNavigation } from "./src/navigation";
import { appInsights, maskPromptId } from "./src/utils";

import { QUERY_OPTIONS_DEFAULT, top_responders } from "~/config";
import {
  PromptContextProvider,
  AccountContext,
  OnboardingContext,
} from "~/contexts";
import { OnboardingScreen } from "~/pages/onboarding";
import {
  defineQuestDataSyncTask,
  nostrService,
  notificationService,
  promptService,
  setupBackgroundTasks,
} from "~/services";
import { toastConfig } from "~/theme";

Logs?.enableExpoCliLogging();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: QUERY_OPTIONS_DEFAULT,
});

// TODO: Register background tasks
defineQuestDataSyncTask();

function App() {
  const responseListener = React.useRef<
    Notifications.Subscription | undefined
  >();
  const navigation = useNavigation<any>();
  const accountContext = React.useContext(AccountContext);
  const onboardingContext = React.useContext(OnboardingContext);

  React.useEffect(() => {
    const userNpub = (async () => {
      return (
        accountContext?.userNpub ?? (await nostrService.getNostrAccount())?.npub
      );
    })();

    appInsights.trackEvent(
      { name: "app_started" },
      {
        userNpub,
      }
    );

    // TODO: register background tasks
    (async () => {
      await setupBackgroundTasks();
    })();

    // validate permission status for user
    (async () => {
      await notificationService.registerForPushNotificationsAsync();
      await notificationService.setUpNotificationCategories();
      await notificationService.scheduleInsightNotifications();

      // TOOD: check if userNpub is    user...make sure that account context is ready
      if (top_responders.includes(accountContext?.userNpub!)) {
        appInsights.trackEvent({
          name: "top_responder_notification_setup",
          properties: { userNpub },
        });
        await notificationService.scheduleOutreachNotifications();
      }

      // set notification handlers
      // what happens when a user responds to notification
      // even in background

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            let notificationCategory: string | null = "";
            if ("categoryIdentifier" in response.notification.request.content) {
              notificationCategory =
                response.notification.request.content.categoryIdentifier;
            }
            if (!notificationCategory) {
              return;
            }
            // remove notification from tray
            Notifications.dismissNotificationAsync(
              response.notification.request.identifier
            );

            if (notificationCategory.startsWith("insight_")) {
              appInsights.trackEvent(
                {
                  name: "insight_notification_clicked",
                },
                {
                  triggerTimestamp: Math.floor(response.notification.date),
                  clickTimestamp: dayjs().valueOf(),
                  userNpub,
                }
              );

              const chartPeriod = notificationCategory.startsWith(
                "insight_weekly"
              )
                ? "week"
                : "month";

              const chartStartDate = dayjs()
                .subtract(1, chartPeriod)
                .startOf(chartPeriod);

              navigation.navigate("InsightsNavigator", {
                screen: "InsightsPage",
                params: {
                  chartPeriod,
                  startDate: chartStartDate,
                },
              });

              return;
            }

            if (notificationCategory === "outreach") {
              appInsights.trackEvent(
                {
                  name: "outreach_notification_clicked",
                },
                {
                  triggerTimestamp: Math.floor(response.notification.date),
                  clickTimestamp: dayjs().valueOf(),
                  userNpub,
                }
              );

              // send the user to the booking page
              // TODO; add the booking page
              console.log("send user to booking page");
              navigation.navigate("HomeNavigator", {
                screen: "BookingPage",
              });
              return;
            }

            /**
             * Logic for handling prompt notifications below
             */
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
            await promptService.savePromptResponse(promptResponse, queryClient);

            // track event
            appInsights.trackEvent(
              {
                name: "prompt_response",
              },
              {
                identifier: await maskPromptId(promptUuid || ""),
                triggerTimestamp: promptResponse.triggerTimestamp,
                responseTimestamp: promptResponse.responseTimestamp,
                userNpub,
              }
            );
          }
        );
    })();
  }, []);

  React.useEffect(() => {
    VersionCheck.needUpdate().then(
      async (res: { isNeeded: boolean; storeUrl: string }) => {
        if (res.isNeeded) {
          Alert.alert(
            "Update Available",
            "A new version of Fusion is available. Please update to get the best experience :)",
            [
              {
                text: "Update",
                onPress: () => Linking.openURL(res.storeUrl),
              },
            ]
          );
        }
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
