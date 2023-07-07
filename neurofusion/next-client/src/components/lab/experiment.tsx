/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/self-closing-comp */
import { DeviceInfo } from "@neurosity/sdk/dist/esm/types/deviceInfo";
import { FC, useState, useEffect } from "react";

import { Button } from "../ui/button/button";

import { connectToNeurosityDevice, useNeurosityState } from "~/hooks";
import { neurosityService, neurosity } from "~/services";

export const Experiment: FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const { user, getNeurositySelectedDevice } = useNeurosityState();
  const [neurositySelectedDevice] = useState(getNeurositySelectedDevice());
  const [deviceStatus, setDeviceStatus] = useState("offline");
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);

  async function startNeurosityRecording() {
    if (connectedDevice) {
      neurosityService.startRecording(connectedDevice?.channelNames);
    }
  }

  async function stopNeurosityRecording() {
    neurosityService.stopRecording();
  }

  useEffect(() => {
    if (user && neurositySelectedDevice) {
      (async () => {
        const connectedDevice = await connectToNeurosityDevice(neurositySelectedDevice);
        if (!connectedDevice) return;
        setConnectedDevice(connectedDevice);
      })();

      (async () => {
        await neurosity.status().subscribe((status) => {
          if (status.state !== deviceStatus) {
            let deviceState: any = status.state;
            if (status.sleepMode) {
              deviceState = "sleep";
            } else {
              deviceState = status.state;
            }
            setDeviceStatus(deviceState);
          }
        });
      })();
    }
  }, [user, deviceStatus, neurositySelectedDevice]);

  return (
    <div>
      <>
        <p>Active Neurosity Device: {connectedDevice?.deviceNickname}</p>
        <p>Device Status: {deviceStatus}</p>
      </>

      {/* add live signal quality */}

      <h1 style={{ marginTop: 10 }}>Flappy Birds</h1>

      <h3>
        Press 'Spacebar' to start the game. We will be recording brain activity & correlate with spacebar presses.
      </h3>
      <>
        {/* <iframe
          src="https://codesandbox.io/embed/flappy-bird-neurofusion-g8pml3?fontsize=14&hidenavigation=1&theme=dark"
          style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
          title="flappy-bird"3
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking; download; fullscreen;"
          sandbox="allow-forms allow-downloads allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe> */}
        <iframe
          src="/api/CDN?id=1&file=index.html"
          style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
          title="Stroop"
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
