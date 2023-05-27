import { FC, useState, useEffect } from "react";
import { Button } from "../../ui/button/button";

import { neurosityService, neurosity } from "~/services";
import { connectToNeurosityDevice, useNeurosityState } from "~/hooks";
import { DeviceInfo } from "@neurosity/sdk/dist/esm/types/deviceInfo";

export const Experiment: FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const { user, getNeurositySelectedDevice } = useNeurosityState();
  const [neurositySelectedDevice] = useState(getNeurositySelectedDevice());
  const [deviceStatus, setDeviceStatus] = useState("offline");
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);

  async function startNeurosityRecording() {
    console.log("about to start recording");
    if (connectedDevice) {
      neurosityService.startRecording(connectedDevice?.channelNames);
    } else {
      window.alert("Please connect to a device");
    }
  }

  async function stopNeurosityRecording() {
    console.log("about to stop recording");
    neurosityService.stopRecording();
  }

  useEffect(() => {
    console.log("user", user);
    console.log("selectedDevice", neurositySelectedDevice);
    if (user && neurositySelectedDevice) {
      console.log("connecting to device");
      (async () => {
        console.log("about to make call");
        const connectedDevice = await connectToNeurosityDevice(neurositySelectedDevice);
        console.log("connectedDevice", connectedDevice);
        if (!connectedDevice) return;
        setConnectedDevice(connectedDevice);
      })();

      (async () => {
        await neurosity.status().subscribe((status) => {
          if (status.state !== deviceStatus) {
            let deviceState: any = status.state;
            status.sleepMode ? (deviceState = "sleep") : (deviceState = status.state);
            setDeviceStatus(deviceState);
          }
        });
      })();
    }
  }, [user]);

  return (
    <div>
      <>
        <p>Active Neurosity Device: {connectedDevice?.deviceNickname}</p>
        <p>Device Status: {deviceStatus}</p>
      </>

      <h1 style={{ marginTop: 10 }}>Flappy Birds</h1>

      <p>Press "Spacebar" to start the game. We will be recording brain activity</p>
      <>
        <iframe
          src="https://codesandbox.io/embed/flappy-bird-forked-1c4g6n?fontsize=14&hidenavigation=1&theme=dark&view=preview"
          style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
          title="flappy-bird"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking; download; fullscreen;"
          sandbox="allow-forms allow-downloads allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      </>
      <>
        {/* TODO: we need a section that throws an error if the eeg device isn't active */}
        {deviceStatus === "online" && (
          <>
            {isRecording ? (
              <Button
                onClick={() => {
                  // stop recording & save eeg data
                  setIsRecording(false);

                  // stop neurosity recording
                  stopNeurosityRecording();
                }}
              >
                Stop EEG Recording
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  // record eeg data
                  setIsRecording(true);

                  // start neurosity recording
                  await startNeurosityRecording();
                }}
              >
                Start EEG Recording
              </Button>
            )}
          </>
        )}
      </>
    </div>
  );
};
``;
