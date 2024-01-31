// import "hazardous";
import { withLatestFrom, share, startWith, filter, tap, map } from "rxjs/operators";
import { addInfo, epoch, bandpassFilter, addSignalQuality } from "@neurosity/pipes";
import { release } from "os";
import { MUSE_SERVICE, MuseClient, zipSamples, EEGSample } from "muse-js";
import { from, Observable } from "rxjs";
import { isNaN } from "lodash";
import { pipe } from "rxjs";
import { IExperiment } from "~/@types";
import { EventData } from "./neurosity.service";

export const MUSE_SAMPLING_RATE = 256;
export const MUSE_CHANNELS = ["TP9", "AF7", "AF8", "TP10"];
export const PLOTTING_INTERVAL = 250; // ms

const INTER_SAMPLE_INTERVAL = -(1 / 256) * 1000;

export enum SIGNAL_QUALITY {
  BAD = "#ed5a5a",
  OK = "#FFCD39",
  GREAT = "#66B0A9",
  DISCONNECTED = "#BFBFBF",
}

export enum SIGNAL_QUALITY_THRESHOLDS {
  BAD = 15,
  OK = 10,
  GREAT = 1.5, // Below 1.5 usually indicates not connected to anything
}

export interface Device {
  // Human readable
  name?: string;
  // Unique ID
  id: string;
}

export interface EEGData {
  data: Array<number>;
  timestamp: number;
  marker?: string | number;
}

export interface PipesEpoch {
  data: number[][];
  signalQuality: { [channelName: string]: number };
  info: {
    samplingRate: number;
    startTime: number;
    channelNames?: string[];
  };
}

if (process.platform === "win32" && parseInt(release().split(".")[0], 10) < 10) {
  console.error("Muse EEG not available in Windows 7");
}

class MuseEEGService {
  museClient: MuseClient;
  dataStorageMode: "local" | "remote" = "local";
  recordingStatus: "not-started" | "started" | "stopped" = "not-started";
  recordingStartTimestamp = 0;

  rawBrainwaveSeries: any = [];
  powerByBandSeries: any = [];
  signalQualitySeries: any = [];
  accelerometerSeries: any = [];

  eventSeries: EventData[] = [];

  constructor(museClient: MuseClient) {
    this.museClient = museClient;
  }

  async startRecording(experiment: IExperiment, channelName: string[], duration: number = 0) {
    // build the dataset streams
  }

  async stopReecording(eventData?: EventData) {}
}

// Awaits Muse connectivity before sending an observable rep. EEG stream
// export const createRawMuseObservable = async () => {
//   await museClient.start();
//   const eegStream = await museClient.eegReadings;
//   const ppgStream = await museClient.ppgReadings;
//   // const markers = await client.eventMarkers.pipe(startWith({ timestamp: 0 }));
//   return from(zipSamples(eegStream)).pipe(
//     // Remove nans if present (muse 2)
//     map<EEGSample, EEGSample>((sample) => ({
//       ...sample,
//       data: sample.data.filter((val) => !isNaN(val)),
//     })),
//     filter((sample) => sample.data.length >= 4),
//     // withLatestFrom(markers, synchronizeTimestamp),
//     share()
//   );
// };

// Creates an observable that will epoch, filter, and add signal quality to EEG stream
// export const createMuseSignalQualityObservable = (rawObservable: Observable<EEGData>, deviceInfo: DeviceInfo) => {
//   const { samplingRate, channels: channelNames } = deviceInfo;
//   const intervalSamples = (PLOTTING_INTERVAL * samplingRate) / 1000;
//   return rawObservable.pipe(
//     addInfo({
//       samplingRate,
//       channelNames,
//     }),
//     epoch({
//       duration: intervalSamples,
//       interval: intervalSamples,
//     }),
//     bandpassFilter({
//       nbChannels: channelNames.length,
//       lowCutoff: 1,
//       highCutoff: 50,
//     }),
//     addSignalQuality(),
//     parseMuseSignalQuality()
//   );
// };

export const parseMuseSignalQuality = () =>
  pipe(
    map((epoch: PipesEpoch) => ({
      ...epoch,
      signalQuality: Object.assign(
        {},
        ...Object.entries(epoch.signalQuality).map(([channelName, signalQuality]) => {
          if (signalQuality >= SIGNAL_QUALITY_THRESHOLDS.BAD) {
            return { [channelName]: SIGNAL_QUALITY.BAD };
          }
          if (signalQuality >= SIGNAL_QUALITY_THRESHOLDS.OK) {
            return { [channelName]: SIGNAL_QUALITY.OK };
          }
          if (signalQuality >= SIGNAL_QUALITY_THRESHOLDS.GREAT) {
            return { [channelName]: SIGNAL_QUALITY.GREAT };
          }
          return { [channelName]: SIGNAL_QUALITY.DISCONNECTED };
        })
      ),
    }))
  );

// Injects an event marker that will be included in muse-js's data stream through
// export const injectMuseMarker = (value: string, time: number) => {
//   museClient.injectMarker(value, time);
// };

// ---------------------------------------------------------------------
// Helpers

// const synchronizeTimestamp = (eegSample, marker) => {
//   if (eegSample.timestamp - marker.timestamp < 0 && eegSample.timestamp - marker.timestamp >= INTER_SAMPLE_INTERVAL) {
//     return { ...eegSample, marker: marker.value };
//   }
//   return eegSample;
// };
