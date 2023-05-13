import React from "react";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  PromptContextProvider,
  savePromptResponse,
  getPromptForNotificationId,
  getNotificationIdsForPrompt,
  maskPromptId,
  appInsights,
} from "./src/utils";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import { FusionNavigation } from "./src/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

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

  return true;
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // get the prompt id for this notification
    const promptUuid = await getPromptForNotificationId(
      notification.request.identifier
    );

    // remove all active notifications for the prompt from system tray
    // that aren't the current one
    const activeNotifications =
      await Notifications.getPresentedNotificationsAsync();

    // find the ones that match the prompt
    const promptNotificationsIds = await getNotificationIdsForPrompt(
      promptUuid || ""
    );

    // only want notification ids for the active prompts
    const activeNotificationsForPrompt = activeNotifications.filter((element) =>
      promptNotificationsIds.includes(element.request.identifier)
    );

    // dismiss all existing notifications - the new notification gets presented after
    for (let i = 0; i < activeNotificationsForPrompt.length; i++) {
      await Notifications.dismissNotificationAsync(
        activeNotificationsForPrompt[i].request.identifier
      );
    }

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
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            const promptUuid = await getPromptForNotificationId(
              response.notification.request.identifier
            );

            if (!promptUuid) {
              console.log("unable to fetch prompt uuid for notification id");
              return;
            }

            if (
              response.actionIdentifier ==
              Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
              navigation.navigate("PromptEntry", {
                promptUuid: promptUuid,
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
            if (notificationCategory == "yesno") {
              response_value = response.actionIdentifier;
            } else if (
              notificationCategory == "text" ||
              notificationCategory == "number"
            ) {
              response_value = response.userText;
            }

            // create prompt object
            const promptResponse = {
              promptUuid: promptUuid || "", // ensure promptUuid is always of type string
              triggerTimestamp: Math.floor(response.notification.date),
              responseTimestamp: Math.floor(dayjs().unix()),
              value: response_value || "",
            };

            // save the prompt response
            await savePromptResponse(promptResponse);

            // track event
            appInsights.trackEvent(
              {
                name: "prompt_notification_response",
              },
              {
                identifier: await maskPromptId(promptUuid || ""),
                triggerTimestamp: promptResponse.triggerTimestamp,
                responseTimestamp: promptResponse.responseTimestamp,
              }
            );

            return;
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
        // paddingBottom: insets.bottom,
        flex: 1,
      }}
    >
      <PromptContextProvider>
        <FusionNavigation />
      </PromptContextProvider>
    </View>
  );
}
