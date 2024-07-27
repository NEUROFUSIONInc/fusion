/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/self-closing-comp */
import { DeviceInfo } from "@neurosity/sdk/dist/esm/types/deviceInfo";
import { FC, useState, useEffect, use, useContext } from "react";

import { Button } from "../ui/button/button";

import { connectToNeurosityDevice, useNeurosityState } from "~/hooks";
import { neurosityService, neurosity } from "~/services";
import { PlugZap } from "lucide-react";

import { IExperiment, EventData } from "~/@types";
import SignalQuality from "./signalquality";
import { Input } from "../ui";
import dayjs from "dayjs";
import exp from "constants";
import { MuseContext } from "~/hooks/muse.context";
import { MuseEEGService, NeuroFusionParsedEEG } from "~/services/integrations/muse.service";
import { SignalViewer } from "./signalviewer";

export const Experiment: FC<IExperiment> = (experiment) => {
  const [isNeurosityRecording, setIsNeurosityRecording] = useState(false);

  const { user, getNeurositySelectedDevice } = useNeurosityState();
  const [neurositySelectedDevice] = useState(getNeurositySelectedDevice());
  const [deviceStatus, setDeviceStatus] = useState("offline");
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);
  const [showSignalQuality, setShowSignalQuality] = useState(true);

  const [sandboxData, setSandboxData] = useState("");

  const museContext = useContext(MuseContext);

  const [duration, setDuration] = useState(0);
  const [tags, setTags] = useState<string[]>([]);

  const [experimentInfo, setExperimentInfo] = useState<IExperiment>(experiment);

  useEffect(() => {
    setExperimentInfo({ ...experiment, duration, tags });
  }, [experiment, tags, duration]);

  async function startNeurosityRecording() {
    if (connectedDevice) {
      console.log(experimentInfo);
      neurosityService.startRecording(experimentInfo, connectedDevice?.channelNames, duration);
    }
  }

  async function stopNeurosityRecording() {
    neurosityService.stopRecording();
  }

  const [museEEGService, setMuseEEGService] = useState<MuseEEGService>();
  useEffect(() => {
    if (museContext?.museClient && museContext?.museService) {
      setMuseEEGService(museContext?.museService!);
    }
  }, [museContext?.museClient]);

  async function startMuseRecording() {
    if (museEEGService) {
      setIsMuseRecording(true);
      await museEEGService.startRecording();
    }
  }

  async function stopMuseRecording() {
    if (museEEGService) {
      setIsMuseRecording(false);
      await museEEGService.stopRecording(true);
    }
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

  if (typeof window !== "undefined") {
    window.addEventListener("message", (event) => {
      // IMPORTANT: Check the origin of the data!
      // You should probably not use '*', but restrict it to certain domains:
      if (
        event.origin.startsWith("https://localhost:") ||
        event.origin.startsWith("https://usefusion.app") ||
        event.origin.startsWith("https://usefusion.ai")
      ) {
        // console.log("event", event);
        if (typeof event.data === "string") {
          return;
        }

        try {
          if (typeof event.data === "object") {
            if (event.data["trials"]) {
              // jspsych events contain trials key...
              setSandboxData(event.data);
            } else {
              // console.log("rejected non experiment data");
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  useEffect(() => {
    if (sandboxData !== "") {
      (async () => {
        await downloadSandboxData(sandboxData, experiment.name, dayjs().unix());
      })();
    }
  }, [sandboxData]);

  // download the data
  async function downloadSandboxData(sandboxData: any, dataName: string, fileTimestamp: number) {
    const fileName = `${dataName}_${fileTimestamp}.json`;

    const hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sandboxData));
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  }

  const [museBrainwaves, setMuseBrainwaves] = useState<NeuroFusionParsedEEG[]>();
  const [isMuseRecording, setIsMuseRecording] = useState(false);
  useEffect(() => {
    // Subscribe to updates
    if (!isMuseRecording) return;
    if (!museContext?.museService) return;
    const unsubscribe = museContext?.museService?.onUpdate((data) => {
      // Handle the new data
      const last1000Brainwaves = data.slice(-1000);
      setMuseBrainwaves(last1000Brainwaves);
    });

    // Unsubscribe on component unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isMuseRecording, museContext?.museService]);

  const [neurosityBrainwaves, setNeurosityBrainwaves] = useState<NeuroFusionParsedEEG[]>();

  useEffect(() => {
    // Subscribe to updates
    if (!isNeurosityRecording) return;
    if (!connectedDevice) return;
    const unsubscribe = neurosityService.onUpdate((data) => {
      // Handle the new data
      console.log("neurosity data", data);
      const last1000Brainwaves = data.slice(-2500);
      setNeurosityBrainwaves(last1000Brainwaves);
    });

    // Unsubscribe on component unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isNeurosityRecording, connectedDevice]);

  return (
    <div className="flex flex-col">
      {/* this needs to move to it's own component */}

      <div id="experiment-container" className="mt-5">
        {experiment.description && (
          <div className="mt-10">
            <h1>Description:</h1>
            <p>{experiment.description}</p>
          </div>
        )}
        {experiment.id == 3 && (
          <>
            <div className="mt-5">
              <div className="my-5">
                <p>
                  Duration<em>(optional)</em> :
                </p>
                <Input
                  type="number"
                  placeholder="Duration (seconds)"
                  onChange={(e) => setDuration(e.target.valueAsNumber)}
                  value={duration ?? 0}
                />
              </div>
              <div className="my-5">
                <p>
                  Tags <em>(optional)</em> :
                </p>
                <Input
                  type="text"
                  placeholder="Tags"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setTags(e.target.value.split(","));
                  }}
                  value={tags.join(",")}
                />
              </div>
            </div>
          </>
        )}

        {experiment.url && (
          <div className="m-3">
            <iframe
              src={experiment.url}
              style={{ width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden" }}
              title={experiment.name}
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking; download; fullscreen;"
              sandbox="allow-forms allow-downloads allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            ></iframe>
          </div>
        )}
        <>
          {sandboxData !== "" && (
            <p>
              Event data obtained
              {/* TODO: include this in the same zip for recordings */}
            </p>
          )}

          {/* TODO: we need a section that throws an error if the eeg device isn't active */}
          {deviceStatus === "online" && (
            <div className="my-10">
              {isNeurosityRecording ? (
                <Button
                  onClick={() => {
                    // stop recording & save eeg data
                    setIsNeurosityRecording(false);

                    // stop neurosity recording
                    stopNeurosityRecording();
                  }}
                >
                  Stop Neurosity EEG Recording
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    // record eeg data
                    setIsNeurosityRecording(true);

                    // start neurosity recording
                    await startNeurosityRecording();
                  }}
                >
                  Start Neurosity EEG Recording
                </Button>
              )}
            </div>
          )}
        </>
      </div>

      {/* Neurosity methods */}
      {experiment.id !== 6 && (
        <>
          <div className="item-start">
            {!connectedDevice && (
              <Button
                intent={"dark"}
                className="ml-auto"
                leftIcon={<PlugZap className="fill-current" />}
                onClick={() => {
                  location.href = "/integrations";
                }}
              >
                Connect Neurosity Crown
              </Button>
            )}
          </div>

          {connectedDevice && (
            <>
              <p>Active Neurosity Device: {connectedDevice?.deviceNickname}</p>
              <p>Device Status: {deviceStatus}</p>
            </>
          )}

          {deviceStatus === "online" && connectedDevice?.channelNames && (
            <div className="flex flex-col justify-between">
              <div className="my-5">
                {showSignalQuality && (
                  <>
                    {neurosityBrainwaves && (
                      <SignalViewer rawBrainwaves={neurosityBrainwaves} channelNames={connectedDevice.channelNames!} />
                    )}

                    <SignalQuality channelNames={connectedDevice?.channelNames} deviceStatus={deviceStatus} />
                  </>
                )}
                <Button
                  onClick={() => {
                    setShowSignalQuality(!showSignalQuality);
                  }}
                >
                  {showSignalQuality ? "Hide" : "Show"} Signal Quality
                </Button>
              </div>
            </div>
          )}

          {/* Muse Methods */}
          <div className="item-start mt-3">
            {!museContext?.museClient && (
              <Button
                intent={"dark"}
                className="ml-auto"
                leftIcon={<PlugZap className="fill-current" />}
                onClick={async () => {
                  museContext?.getMuseClient();
                }}
              >
                Connect Muse Headset
              </Button>
            )}
          </div>

          {museContext?.museClient && (
            <div className="mt-4">
              <p>Active Muse Device: {museContext?.museClient?.deviceName}</p>

              {/* display live eeg */}
              <div className="flex gap-x-5 mt-3">
                {!isMuseRecording ? (
                  <>
                    <Button
                      onClick={() => {
                        startMuseRecording();
                      }}
                    >
                      Start Muse EEG Recording
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={async () => {
                        stopMuseRecording();
                      }}
                    >
                      Stop Muse EEG Recording
                    </Button>
                  </>
                )}

                <div>
                  {museBrainwaves && (
                    <>
                      <SignalViewer
                        rawBrainwaves={museBrainwaves}
                        channelNames={museContext.museService?.channelNames!}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
