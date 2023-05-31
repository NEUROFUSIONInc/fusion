import "./globals.js";
import { registerRootComponent } from "expo";
import React from "react";

import App from "./App";
import { NavigationContainer } from "./src/navigation/navigation-container";

const MainApp = () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(MainApp);
