import type { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fusion",
  slug: "fusion",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  backgroundColor: "#0B0816",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0B0816",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.neurofusion.fusion",
    buildNumber: "28",
    backgroundColor: "#0B0816",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0B0816",
    },
    package: "com.neurofusion.fusion",
    versionCode: 19,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  jsEngine: "hermes",
  extra: {
    eas: {
      projectId: "f79cfe2d-2f56-413a-89f8-b9fde538ac75",
    },
    storybookEnabled: process.env.STORYBOOK_ENABLED,
    appInsightsConnectionString:
      process.env.APP_INSIGHTS_CONNECTION_STRING ??
      "InstrumentationKey=5a52ca8a-bd71-4c4c-84f6-d51429acbe03;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/",
  },
  plugins: ["expo-notifications"],
  owner: "oreogundipe",
});
