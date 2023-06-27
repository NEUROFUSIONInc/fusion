import { Neurosity, ReactNativeTransport } from "@neurosity/sdk";
import { STREAMING_MODE } from "@neurosity/sdk/dist/esm/types/streaming";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import BleManager from "react-native-ble-manager";

(async () => {
  // TODO: only do this when we're not on emulator
  const state = await BleManager.checkState();
  console.log("BLE state:", state);
})();

export const neurosity = new Neurosity({
  autoSelectDevice: false,
  bluetoothTransport: new ReactNativeTransport({
    autoConnect: false,
    // @ts-ignore
    BleManager,
    bleManagerEmitter: new NativeEventEmitter(NativeModules.BleManager),
    platform: Platform.OS,
  }),
  streamingMode: STREAMING_MODE.BLUETOOTH_WITH_WIFI_FALLBACK,
});
