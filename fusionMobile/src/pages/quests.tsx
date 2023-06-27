import { Peripheral } from "@neurosity/sdk/dist/esm/api/bluetooth/react-native/types/BleManagerTypes";
import React from "react";
import { StyleSheet, Button, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

import { neurosity } from "~/utils";

export interface ScannedDevice {
  label: string;
  value: string;
}

export function QuestsScreen() {
  const { bluetooth } = neurosity;

  // for device picker
  const [devicePickerOpen, setDevicePickerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState("");
  const [availableDevices, setAvailableDevices] = React.useState<Peripheral[]>(
    []
  );
  const [deviceSelectorItems, setDeviceSelectorItems] = React.useState<
    ScannedDevice[]
  >([]);

  React.useEffect(() => {
    bluetooth.connection().subscribe((connection) => {
      console.log(`Bluetooth connected is ${connection}`);

      if (connection === "disconnected") {
        bluetooth.scan().subscribe((devices: Peripheral[]) => {
          if (devices.length > 0) {
            setAvailableDevices(devices);
          }
        });
      } else if (connection === "connected") {
        console.log("Bluetooth is connected, getting info");

        bluetooth
          .getDeviceId()
          .then(async (deviceId) => {
            console.log(`Device id is ${deviceId}`);
          })
          .catch((err) => {
            console.log(`Error getting device id ${err}`);
          });

        bluetooth.status().subscribe((status) => {
          console.log(`Bluetooth status is ${status}`);
        });
      }
    });
  }, []);

  React.useEffect(() => {
    if (availableDevices.length > 0) {
      const peripheralList: any = [];
      availableDevices.filter((device) => {
        if (device.name) {
          peripheralList.push({
            label: device.name,
            value: device.id,
          });
        }
      });

      if (peripheralList.length > 0) {
        setDeviceSelectorItems(peripheralList);
      }
    }
  }, [availableDevices]);

  React.useEffect(() => {
    if (selectedDevice) {
      // find item from deviceseletoritems where id matches
      const selectedDeviceObject = availableDevices.find(
        (item) => item.id === selectedDevice
      );

      if (selectedDeviceObject) {
        console.log(`Selected device is ${selectedDeviceObject.name}`);
        (async () => {
          console.log(`Connecting to ${selectedDeviceObject.name}`);

          bluetooth
            .connect(selectedDeviceObject)
            .then((connection) => {
              console.log(`Bluetooth connected is ${connection}`);
            })
            .catch((err) => {
              console.log(`Bluetooth connect error is ${err}`);
            });
        })();
      }
    }
  }, [selectedDevice]);

  return (
    <View style={styles.container}>
      <Text>Start a brain recording</Text>

      {availableDevices.length > 0 && (
        <DropDownPicker
          value={selectedDevice}
          items={deviceSelectorItems}
          placeholder="Select Device"
          setValue={setSelectedDevice}
          setItems={setDeviceSelectorItems}
          open={devicePickerOpen}
          setOpen={setDevicePickerOpen}
        />
      )}

      <Button title="Start Recording" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
