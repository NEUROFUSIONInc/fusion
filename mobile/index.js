import "./globals.js";
import { registerRootComponent } from "expo";
import React from "react";
import { Alert } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import PolyfillCrypto from "react-native-webview-crypto";

import App from "./App.tsx";
import { NavigationContainer } from "./src/navigation/navigation-container.tsx";

import { AccountContextProvider } from "~/contexts/account.context.tsx";
import { OnboardingContextProvider } from "~/contexts/onboarding.context.tsx";
import { createBaseTables } from "~/lib";

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

(async () => {
  const setupStatus = await createBaseTables();
  if (!setupStatus) {
    Alert.alert("Error", "There was an error setting up the app.");
  }
})();

const MainApp = () => {
  return (
    <>
      {/* Added to support window.crypto.subtle calls required for nostr */}
      <PolyfillCrypto />
      <NavigationContainer>
        <OnboardingContextProvider>
          <AccountContextProvider>
            <App />
          </AccountContextProvider>
        </OnboardingContextProvider>
      </NavigationContainer>
    </>
  );
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(MainApp);
