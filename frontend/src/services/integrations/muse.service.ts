// import "hazardous";
import { release } from "os";
import { MuseClient } from "muse-js";
import { IExperiment, DatasetExport, EventData } from "~/@types";
import dayjs from "dayjs";
import { downloadDataAsZip, getCSVFile, writeToLocalStorage } from "../storage.service";
import { createHash } from "crypto";
import { getFileHash, signData } from "../signer.service";
import { uploadToCeramic } from "../storage.service";

export const MUSE_SAMPLING_RATE = 256;
export const MUSE_CHANNELS = ["TP9", "AF7", "AF8", "TP10"];
export const PLOTTING_INTERVAL = 250; // ms

const INTER_SAMPLE_INTERVAL = (1 / 256) * 1000;

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

interface MuseEEGReadings {
  index: number;
  electrode: number;
  samples: number[];
  timestamp: number;
}

export interface NeuroFusionParsedEEG {
  index: number;
  unixTimestamp: number;
  [channelName: string]: number;
}

interface MusePPGReadings {
  index: number;
  ppgChannel: number;
  samples: number[];
  timestamp: number;
}

interface accelerometerEntry {
  x: number;
  y: number;
  z: number;
}
interface MuseAccelerometerData {
  samples: accelerometerEntry[];
}

export class MuseEEGService {
  museClient: MuseClient;
  dataStorageMode: "local" | "remote" = "local";
  recordingStatus: "not-started" | "started" | "stopped" = "not-started";
  recordingStartTimestamp = 0;

  ppgSeries: any = [];
  accelerometerSeries: any = [];
  rawBrainwaveSeries: any = {};
  rawBrainwavesParsed: NeuroFusionParsedEEG[] = [];

  eventSeries: EventData[] = [];

  channelNames: string[] = ["TP9", "AF7", "AF8", "TP10"];

  private subscribers: Array<(data: any) => void> = [];

  constructor(museClient: MuseClient) {
    this.museClient = museClient;

    this.museClient.eegReadings.subscribe((eegReadings: MuseEEGReadings) => {
      if (!this.rawBrainwaveSeries[eegReadings.timestamp]) {
        this.rawBrainwaveSeries[eegReadings.timestamp] = {
          0: [],
          1: [],
          2: [],
          3: [],
        };
      }

      // Update the samples for the specific electrode at this timestamp
      this.rawBrainwaveSeries[eegReadings.timestamp][eegReadings.electrode] = eegReadings.samples;

      // first check that all the data for timestamp exists..
      if (
        this.rawBrainwaveSeries[eegReadings.timestamp][0].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][1].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][2].length == eegReadings.samples.length &&
        this.rawBrainwaveSeries[eegReadings.timestamp][3].length == eegReadings.samples.length
      ) {
        // Iterate over each electrode key in the timestamp
        let sampleIndex = 0;
        for (sampleIndex; sampleIndex < this.rawBrainwaveSeries[eegReadings.timestamp][0].length; sampleIndex++) {
          let brainwaveEntry: any = {};
          brainwaveEntry["index"] = sampleIndex;
          brainwaveEntry["unixTimestamp"] = eegReadings.timestamp + sampleIndex * INTER_SAMPLE_INTERVAL;

          let chIndex = 0;
          for (chIndex; chIndex < this.channelNames.length; chIndex++) {
            brainwaveEntry[this.channelNames[chIndex]] =
              this.rawBrainwaveSeries[eegReadings.timestamp][chIndex][sampleIndex];
          }
          this.rawBrainwavesParsed.push(brainwaveEntry);
        }
        // drop the entry from the rawBrainwaveSeries
        delete this.rawBrainwaveSeries[eegReadings.timestamp];
        this.notifySubscribers(this.rawBrainwavesParsed);
      }
    });

    // this.museClient.ppgReadings.subscribe((ppgReadings: MusePPGReadings) => {
    //   console.log(ppgReadings);
    // });

    // this.museClient.accelerometerData.subscribe((accelerometerData) => {
    //   console.log(accelerometerData);
    // });
  }

  // Notify all subscribers with the new data
  private notifySubscribers(data: any): void {
    this.subscribers.forEach((callback) => callback(data));
  }

  // Method for components to call to subscribe to new data updates
  public onUpdate(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);

    // Return an unsubscribe function that removes the callback from the subscribers list
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  async startRecording(experiment: IExperiment) {
    // @ts-ignore
    this.recordingStartTimestamp = dayjs().unix();
    this.recordingStatus = "started";

    /**
     * Add experiment data to the store
     */
    const eventEntry: EventData = {
      startTimestamp: this.recordingStartTimestamp,
      duration: experiment.duration ?? 0,
      data: JSON.stringify(experiment),
    };
    this.eventSeries.push(eventEntry);

    this.museClient.start();
  }

  async stopRecording(
    withDownload = false,
    signDataset = false,
    storageMode: "local" | "remote" | "ceramic" = "local"
  ) {
    this.museClient.pause();
    // prepare files for download
    const datasetExport: DatasetExport = {
      fileNames: [`rawBrainwaves_${this.recordingStartTimestamp}.csv`, `events_${this.recordingStartTimestamp}.csv`],
      dataSets: [this.rawBrainwavesParsed, this.eventSeries],
    };

    console.log("storageMode", storageMode);
    if (storageMode === "ceramic") {
      console.log("uploading to ceramic");
      const brainwavesCSV = await getCSVFile(
        `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
        this.rawBrainwavesParsed
      );
      const contentHash = await getFileHash(brainwavesCSV);
      console.log("contentHash", contentHash);

      const res = await uploadToCeramic(brainwavesCSV);
      console.log("res", res);
    }

    if (signDataset) {
      const brainwavesCSV = await getCSVFile(
        `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
        this.rawBrainwavesParsed
      );
      const contentHash = await getFileHash(brainwavesCSV);

      try {
        const signature = await signData(
          `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
          this.recordingStartTimestamp,
          dayjs().valueOf(),
          contentHash,
          {
            deviceId: this.museClient.deviceName!,
          }
        );
        console.log("attestation, saving dataset", signature);
      } catch (e) {
        console.log("error signing data", e);
      }
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(brainwavesCSV);
      downloadLink.download = `rawBrainwaves_${this.recordingStartTimestamp}.csv`;
      downloadLink.click();
    }

    try {
      if (withDownload) {
        await downloadDataAsZip(datasetExport, `fusionDataExport`, dayjs.unix(this.recordingStartTimestamp));
      } else {
        await writeToLocalStorage(datasetExport, dayjs.unix(this.recordingStartTimestamp));
      }
    } catch (e) {
      console.log(e);
    } finally {
      // empty series
      this.ppgSeries = [];
      this.rawBrainwaveSeries = {};
      this.rawBrainwavesParsed = [];
      this.eventSeries = [];
      this.accelerometerSeries = [];
      this.recordingStartTimestamp = 0;
      this.recordingStatus = "stopped";
    }

    return datasetExport;
  }
}
