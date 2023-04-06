import React from "react";
import { Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { FusionNavigation } from "./components/navbar.js";
import { PromptContextProvider, saveFusionEvent } from "./utils";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

import { db } from "./utils";

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
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const responseListener = React.useRef();

  React.useEffect(() => {
    // validate permission status for user
    (async () => {
      const permissionStatus = await registerForPushNotificationsAsync();
      if (!permissionStatus) {
        Alert.alert(
          "Error",
          "Failed to register for push notifications, please quit & restart the app"
        );
        return;
      }

      // TODO: set custom catgeories based on prompts
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

      let placeholderTextInput = {};
      let placeholderNumberInput = {};

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
    })();

    // set notification handlers
    (async () => {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("notification response");
          console.log(JSON.stringify(response));

          let eventObj = {
            uuid: response.notification.request.identifier,
            name: response.notification.request.content.title,
            description: response.notification.request.content.title,
          };

          const notificationCategory =
            response.notification.request.content.categoryIdentifier;

          // if no response do nothing
          // TODO: show user options to manually respond to prompt
          if (
            response.actionIdentifier == Notifications.DEFAULT_ACTION_IDENTIFIER
          ) {
            console.log("default action - no response");
            return;
          }
          // get response from notification
          if (notificationCategory == "yesno") {
            eventObj["value"] = response.actionIdentifier;
          } else if (
            notificationCategory == "text" ||
            notificationCategory == "number"
          ) {
            eventObj["value"] = response.userText;
          }

          const fusionEvent = {
            startTimestamp: Math.floor(response.notification.date), // when the notification was triggered
            endTimestamp: Math.floor(dayjs().unix()), // when it was responded to
            event: eventObj,
          };

          console.log(fusionEvent);

          // save locally
          // TODO: when saving, check if:
          // 1. the event is already saved
          // 2. if there is an event already with the same name, add the UUID if it's empty
          (async () => {
            await saveFusionEvent(fusionEvent);
            // remove notification from system tray
            console.log("removing notification");
            console.log(response.notification.request.identifier);
            Notifications.dismissNotificationAsync(
              response.notification.request.identifier
            );
          })();

          return;
        });
    })();
  }, []);

  /**
   * Create the base tables for the app.
   */
  React.useEffect(() => {
    db.transaction((tx) => {
      // tx.executeSql(`DROP TABLE IF EXISTS prompt_responses;`);
      // tx.executeSql(`DROP TABLE IF EXISTS prompts;`);

      // Create prompts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS prompts (
          uuid TEXT PRIMARY KEY,
          promptText TEXT,
          responseType TEXT,
          notificationConfig_days TEXT,
          notificationConfig_startTime TEXT,
          notificationConfig_endTime TEXT,
          notificationConfig_countPerDay INTEGER
        );`
      );

      // Create prompt responses table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS prompt_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          promptUuid TEXT,
          triggerTimestamp INTEGER,
          responseTimestamp INTEGER,
          value TEXT,
          FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
        );`
      );

      // Create prompt notifications table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS prompt_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          promptUuid TEXT,
          notificationId TEXT,
          FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
        );`
      );

      // tx.executeSql("select * from prompts", [], (_, { rows }) =>
      //   console.log(JSON.stringify(rows))
      // );
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PromptContextProvider>
        <NavigationContainer>
          <FusionNavigation />
        </NavigationContainer>
      </PromptContextProvider>
    </SafeAreaView>
  );
}
