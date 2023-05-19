import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactNativePlugin } from "@microsoft/applicationinsights-react-native";

const RNPlugin = new ReactNativePlugin();
export const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      "InstrumentationKey=5a52ca8a-bd71-4c4c-84f6-d51429acbe03;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/",
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
