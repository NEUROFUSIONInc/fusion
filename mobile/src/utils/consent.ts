import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import { appInsights } from "./appInsights";

export const requestCopilotConsent = async (userNpub: string) => {
  // TODO: this should actually be a bottom sheet component
  // ask user to enable copilot
  let copilotConsent =
    (await AsyncStorage.getItem("copilot_consent")) === "true";

  const getConstentValue = async () =>
    new Promise((resolve) => {
      Alert.alert(
        "Enable Fusion Copilot",
        "Get personalized summaries and recommendations based on your check-ins.\n\nYour responses will be analyzed anonymously and not stored. You can disable this anytime in settings.",
        [
          {
            text: "Use Fusion Copilot",
            onPress: async () => {
              appInsights.trackEvent({
                name: "copilot_consent",
                properties: {
                  consent: "true",
                  userNpub,
                },
              });

              await AsyncStorage.setItem("copilot_consent", "true");
              resolve(true);
            },
          },
          {
            text: "Not now",
            onPress: async () => {
              appInsights.trackEvent({
                name: "copilot_consent",
                properties: {
                  consent: "false",
                  userNpub,
                },
              });

              await AsyncStorage.setItem("copilot_consent", "false");
              resolve(false);
            },
          },
        ]
      );
    });

  copilotConsent = (await getConstentValue()) as boolean;

  return copilotConsent;
};
