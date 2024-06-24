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
        "Fusion Copilot Consent",
        "Fusion Copilot will send you summaries and suggested actions based on your responses over time.\n\n When enabled, your prompt & responses will be sent to Fusion analysis servers for processing. Your data will not be saved.\n\n You can change this in your app settings.",
        [
          {
            text: "Enable",
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
