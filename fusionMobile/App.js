import React from "react";
import { StyleSheet, Image, Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import * as Notifications from "expo-notifications";

import logo from "./assets/icon.png";
import { HomeScreen } from "./pages/home.js";
import { PromptScreen } from "./pages/prompt.js";
import { ResponsesScreen } from "./pages/responses.js";

import { PromptContextProvider, saveFusionEvent } from "./utils";

function LogoTitle() {
  return <Image source={logo} style={{ width: 35, height: 35 }} />;
}

const Stack = createNativeStackNavigator();

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

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
        console.log("Not registered for push notifications");
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

      await Notifications.setNotificationCategoryAsync("number", [
        {
          identifier: "number",
          buttonTitle: "Respond",
          textInput: {
            submitButtonTitle: "Log",
            placeholder: "Enter a number",
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
            placeholder: "Type your response here",
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
          // console.log("notification response");
          // console.log(response.notification);

          let eventObj = {
            name: response.notification.request.content.title,
            description: response.notification.request.content.title,
          };
          const notificationCategory =
            response.notification.request.content.categoryIdentifier;

          // if no response do nothing
          if (
            response.actionIdentifier == Notifications.DEFAULT_ACTION_IDENTIFIER

            // this could be fore click

            // TODO: show user options to add prompt entry! new components for sure
          ) {
            console.log("default action - no response");
            return;
          }

          if (notificationCategory == "yesno") {
            eventObj["value"] = response.actionIdentifier;
          } else if (
            notificationCategory == "text" ||
            notificationCategory == "number"
          ) {
            eventObj["value"] = response.userText;
          }

          const fusionEvent = {
            startTimestamp: Math.floor(response.notification.date),
            endTimestamp: Math.floor(response.notification.date),
            event: eventObj,
          };

          // save locally
          (async () => {
            await saveFusionEvent(fusionEvent);
          })();
        });
    })();
  }, []);

  return (
    <PromptContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
          />
          <Stack.Screen
            name="AuthorPrompt"
            component={PromptScreen}
            options={{ title: "Author Prompt" }}
          />
          <Stack.Screen
            name="ViewResponses"
            component={ResponsesScreen}
            options={{ title: "Prompt Responses" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PromptContextProvider>
  );
}
