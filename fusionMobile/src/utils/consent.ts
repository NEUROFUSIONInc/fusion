import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

import { appInsights } from "./appInsights";

export const requestCopilotConsent = async (userNpub: string) => {
  // ask user to enable copilot
  Alert.alert(
    "Enable Fusion Copilot",
    "Fusion Copilot will send you summaries and suggested actions based on your responses over time.\n\n When enabled, your prompt & responses will be sent for processing to our servers. Your information will not be saved Fusion servers after processing.",
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

          await SecureStore.setItemAsync("copilotConsent", "true");
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

          await SecureStore.setItemAsync("copilotConsent", "false");
        },
      },
    ]
  );
};
