import type { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fusion",
  slug: "fusion",
  version: "2.0.2",
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
    buildNumber: "92",
    backgroundColor: "#0B0816",
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      UIBackgroundModes: ["remote-notification", "fetch"],
    },
    // associatedDomains: ["applinks:usefusion.ai", "applinks:usefusion.app"],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0B0816",
    },
    package: "com.neurofusion.fusion",
    versionCode: 92,
    softwareKeyboardLayoutMode: "pan",
    permissions: [
      "android.permission.health.READ_STEPS",
      "android.permission.health.READ_HEART_RATE",
      "android.permission.health.READ_SLEEP",
    ],
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
    fusionBackendUrl:
      process.env.FUSION_BACKEND_API_URL ??
      "https://neurofusionbackendprd.azurewebsites.net", //"https://neurofusion-backend.azurewebsites.net",
    fusionRelayUrl: "wss://relay.usefusion.ai",
    fusionNostrPublicKey:
      "5f3a52d8027cdde03a41857e98224dafd69495204d93071199aa86921aa02674",
  },
  plugins: [
    // ["expo-notifications", { icon: "./assets/notification-icon.png" }],
    "expo-font",
    "react-native-iap",
    "expo-secure-store",
    ["react-native-health-connect"],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 26,
        },
        ios: {
          deploymentTarget: "15.0",
        },
      },
    ],
  ],
  userInterfaceStyle: "automatic",
  owner: "oreogundipe",
});
