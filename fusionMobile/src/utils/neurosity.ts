import { Neurosity, ReactNativeTransport } from "@neurosity/sdk";
import { STREAMING_MODE } from "@neurosity/sdk/dist/esm/types/streaming";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import BleManager from "react-native-ble-manager";

export const neurosity = new Neurosity({
  autoSelectDevice: true,
  bluetoothTransport: new ReactNativeTransport({
    // @ts-ignore
    BleManager,
    bleManagerEmitter: new NativeEventEmitter(NativeModules.BleManager),
    platform: Platform.OS,
  }),
  streamingMode: STREAMING_MODE.BLUETOOTH_WITH_WIFI_FALLBACK,
});
