import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import React from "react";
import { Alert, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FusionNavigation } from "./src/navigation";
import {
  PromptContextProvider,
  savePromptResponse,
  getPromptForNotificationId,
  getNotificationIdsForPrompt,
  maskPromptId,
  appInsights,
} from "./src/utils";

const registerForPushNotificationsAsync = async () => {
  //TODO: follow the guide again for checking on Android/iOS
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert("Error", "Failed to get push token for push notification!");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export default function App() {
  const responseListener = React.useRef<
    Notifications.Subscription | undefined
  >();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    // validate permission status for user
    (async () => {
      const permissionStatus = await registerForPushNotificationsAsync();
      if (!permissionStatus) {
        Alert.alert(
          "Error",
          "Failed to register for push notifications, please quit, turn on notifications for fusion & restart the app"
        );
        return;
      }

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

            const promptUuid = await getPromptForNotificationId(
              response.notification.request.identifier
            );

            if (!promptUuid) {
              console.log("unable to fetch prompt uuid for notification id");
              return;
            }

            // dismiss all other notifications for this prompt
            const notificationIds = await getNotificationIdsForPrompt(
              promptUuid
            );
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
            await savePromptResponse(promptResponse);

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
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <PromptContextProvider>
        <FusionNavigation />
      </PromptContextProvider>
    </View>
  );
}
