import "./globals.js";
import { registerRootComponent } from "expo";
import React from "react";
import { Alert } from "react-native";

import App from "./App.tsx";
import { NavigationContainer } from "./src/navigation/navigation-container.tsx";

import { AccountContextProvider } from "~/contexts/account.context.tsx";
import { createBaseTables } from "~/lib";

(async () => {
  const setupStatus = await createBaseTables();
  if (!setupStatus) {
    Alert.alert("Error", "There was an error setting up the app.");
  }
})();

const MainApp = () => {
  return (
    <NavigationContainer>
      <AccountContextProvider>
        <App />
      </AccountContextProvider>
    </NavigationContainer>
  );
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(MainApp);
