import { FC, useState } from "react";
import { Button } from "../../ui/button/button";

export const Experiment: FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div>
      <h1>Flappy Birds</h1>

      <>
        <iframe
          src="https://codesandbox.io/embed/flappy-bird-forked-68ttce?fontsize=14&hidenavigation=1&theme=dark&view=preview"
          style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
          title="flappy-bird (forked)"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      </>
      <>
        {isRecording ? (
          <Button
            onClick={() => {
              // stop recording & save eeg data
              setIsRecording(false);
            }}
          >
            Stop EEG Recording
          </Button>
        ) : (
          <Button
            onClick={() => {
              // record eeg data
              setIsRecording(true);
            }}
          >
            Start EEG Recording
          </Button>
        )}
      </>
    </div>
  );
};
