import { FC, useState } from "react";
import { Button } from "../../ui/button/button";

import { neurosityService, neurosity } from "~/services";
import { connectToNeurosityDevice, useNeurosityState } from "~/hooks";

export const Experiment: FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const { user, getNeurositySelectedDevice } = useNeurosityState();

  async function startNeurosityRecording() {
    console.log("about to start recording");
    const selectedDevice = getNeurositySelectedDevice();
    console.log("user selected device", selectedDevice);
    if (selectedDevice) {
      const device = await connectToNeurosityDevice(selectedDevice);
      const channelNames = (await neurosity.getInfo()).channelNames;
      console.log("channelNames", channelNames);
      neurosityService.startRecording(channelNames);
    }
  }

  async function stopNeurosityRecording() {
    console.log("about to stop recording");
    neurosityService.stopRecording();
  }

  return (
    <div>
      <h1>Flappy Birds</h1>

      <p>Press "Spacebar" to start the game. We will be recording brain activity</p>
      <>
        <iframe
          src="https://codesandbox.io/embed/flappy-bird-forked-68ttce?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview"
          style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
          title="flappy-bird"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking; download; fullscreen;"
          sandbox="allow-forms allow-downloads allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      </>
      <>
        {/* TODO: we need a section that throws an error if the eeg device isn't active */}
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
    </div>
  );
};
