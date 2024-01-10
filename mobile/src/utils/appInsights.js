import { ReactNativePlugin } from "@microsoft/applicationinsights-react-native";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import Constants from "expo-constants";

const RNPlugin = new ReactNativePlugin();
export const appInsights = new ApplicationInsights({
  config: {
    connectionString: Constants.expoConfig.extra.appInsightsConnectionString,
    extensions: [RNPlugin],
    disableDeviceCollection: true,
  },
});
appInsights.addTelemetryInitializer((envelope) => {
  envelope.tags["ai.cloud.role"] = "FusionMobile";
  envelope.tags["ai.device.osVersion"] = RNPlugin.getDevice().osVersion;
  envelope.tags["ai.device.osName"] = RNPlugin.getDevice().osName;
  envelope.tags["ai.device.type"] = RNPlugin.getDevice().type;
  envelope.tags["ai.device.locale"] = RNPlugin.getDevice().locale;
  envelope.tags["ai.device.model"] = RNPlugin.getDevice().model;
  envelope.tags["ai.device.networkType"] = RNPlugin.getDevice().networkType;
  envelope.tags["ai.device.screenResolution"] =
    RNPlugin.getDevice().screenResolution;
  envelope.tags["ai.device.timeZone"] = RNPlugin.getDevice();
  envelope.baseData;
});
appInsights.loadAppInsights();
