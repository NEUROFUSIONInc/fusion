import { Neurosity, ReactNativeTransport } from "@neurosity/sdk";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import BleManager from "react-native-ble-manager";
import { STREAMING_MODE } from "@neurosity/sdk/dist/esm/types/streaming";

export const neurosity = new Neurosity({
  autoSelectDevice: true,
  bluetoothTransport: new ReactNativeTransport({
    BleManager,
    bleManagerEmitter: new NativeEventEmitter(NativeModules.BleManager),
    platform: Platform.OS,
  }),
  streamingMode: STREAMING_MODE.BLUETOOTH_WITH_WIFI_FALLBACK,
});
