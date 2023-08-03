import { PortalProvider } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Logs } from "expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React from "react";
import { Alert, Linking, Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { FontLoader } from "./FontLoader";
import { CustomNavigation } from "./src/navigation";
import { appInsights, maskPromptId } from "./src/utils";

import { QUERY_OPTIONS_DEFAULT } from "~/config";
import { PromptContextProvider } from "~/contexts";
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

const registerForPushNotificationsAsync = async () => {
  //TODO: follow the guide again for checking on Android/iOS
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  (async () => {
    if (existingStatus !== "granted") {
      Alert.alert(
        "Notification Permission",
        "We need your permission to send you notifications based on your prompt settings.",
        [
          {
            text: "OK",
            onPress: async () => {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
              if (finalStatus !== "granted") {
                Alert.alert(
                  "Enable notifications",
                  "We only notify you based on your prompt settings. Please enable notifications in your settings to continue.",
                  [
                    {
                      text: "OK",
                      onPress: async () => {
                        Linking.openURL("app-settings:Fusion");
                      },
                    },
                  ]
                );
              } else {
                if (Platform.OS === "android") {
                  await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF231F7C",
                  });
                }
              }
            },
          },
        ]
      );
    } else {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }
  })();
};

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
  const navigation = useNavigation();

  React.useEffect(() => {
    // validate permission status for user
    (async () => {
      await registerForPushNotificationsAsync();
      /**
       * Set up notification categories
       * TODO: set custom catgeories based on prompts
       */
      await Notifications.setNotificationCategoryAsync("yesno", [
        {
          identifier: "Yes",
          buttonTitle: "Yes",
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: "No",
          buttonTitle: "No",
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
      let placeholderTextInput = { placeholder: "" };
      let placeholderNumberInput = { placeholder: "" };
      // This is work around a bug in expo-notifications
      if (Platform.OS !== "android") {
        placeholderTextInput = {
          placeholder: "Type your response here",
        };
        placeholderNumberInput = {
          placeholder: "Enter a number",
        };
      }
      await Notifications.setNotificationCategoryAsync("number", [
        {
          identifier: "number",
          buttonTitle: "Respond",
          textInput: {
            submitButtonTitle: "Log",
            ...placeholderNumberInput,
          },
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
      await Notifications.setNotificationCategoryAsync("text", [
        {
          identifier: "text",
          buttonTitle: "Respond",
          textInput: {
            submitButtonTitle: "Log",
            ...placeholderTextInput,
          },
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
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
              navigation.navigate("PromptEntry", {
                promptUuid,
                triggerTimestamp: Math.floor(response.notification.date),
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
              }
            );
          }
        );
    })();
  }, []);

  React.useEffect(() => {
    appInsights.trackEvent({ name: "app_started" });
  }, []);

  return (
    <GestureHandlerRootView className="flex flex-1 flex-grow-1">
      <FontLoader>
        <StatusBar barStyle="light-content" />
        <QueryClientProvider client={queryClient}>
          <PromptContextProvider>
            <PortalProvider>
              <CustomNavigation />
            </PortalProvider>
          </PromptContextProvider>
        </QueryClientProvider>
      </FontLoader>
      <Toast config={toastConfig} position="bottom" />
    </GestureHandlerRootView>
  );
}

let AppEntryPoint = App;

if (Constants.expoConfig?.extra?.storybookEnabled === "true") {
  AppEntryPoint = require("./.storybook").default;
}

export default AppEntryPoint;
