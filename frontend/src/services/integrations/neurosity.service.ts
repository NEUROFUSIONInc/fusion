import { Neurosity, WebBluetoothTransport } from "@neurosity/sdk";
import { Epoch, PSD } from "@neurosity/sdk/dist/esm/types/brainwaves";
import axios from "axios";
import dayjs from "dayjs";
// eslint-disable-next-line import/no-extraneous-dependencies
import { takeWhile } from "rxjs";
import * as path from "path";
import * as Papa from "papaparse";
import { promises as fsPromises } from "fs";
import JSZip, { JSZipFileOptions } from "jszip";
import { DatasetExport, IExperiment } from "~/@types";
import { downloadDataAsZip } from "../storage.service";

export declare enum STREAMING_MODE {
  WIFI_ONLY = "wifi-only",
  WIFI_WITH_BLUETOOTH_FALLBACK = "wifi-with-bluetooth-fallback",
  BLUETOOTH_WITH_WIFI_FALLBACK = "bluetooth-with-wifi-fallback",
}

export const neurosity = new Neurosity({
  autoSelectDevice: false,
  timesync: true,
  // bluetoothTransport: new WebBluetoothTransport(),
  // streamingMode: STREAMING_MODE.BLUETOOTH_WITH_WIFI_FALLBACK,
});

export interface EventData {
  startTimestamp: number;
  duration: number;
  data: string;
}

export interface PowerByBand {
  data: {
    gamma: number[];
    beta: number[];
    alpha: number[];
    theta: number[];
    delta: number[];
  };
}

class NeurosityService {
  rawBrainwavesSeries: any = [];
  powerByBandSeries: any = [];
  signalQualitySeries: any = [];
  fftSeries: any = [];
  focusSeries: any = [];
  calmSeries: any = [];
  accelerometerSeries: any = [];

  eventSeries: EventData[] = [];

  // datastorage mode, fetch from localstorage...
  dataStorageMode: "local" | "remote" = "local";
  recordingStatus: "not-started" | "started" | "stopped" = "not-started";

  recordingStartTimestamp = 0;

  async stopRecording(eventData?: EventData) {
    this.recordingStatus = "stopped";
    if (eventData) {
      console.log("stopping recording passing eventData:\n", eventData);
      this.eventSeries.push(eventData);
    }

    // call the download data as zip function
    const datasetExport: DatasetExport = {
      fileNames: [
        `rawBrainwaves_${this.recordingStartTimestamp}.csv`,
        `powerByBand_${this.recordingStartTimestamp}.csv`,
        `signalQuality_${this.recordingStartTimestamp}.csv`,
        `psd_${this.recordingStartTimestamp}.csv`,
        `accelerometer_${this.recordingStartTimestamp}.csv`,
        `focus_${this.recordingStartTimestamp}.csv`,
        `calm_${this.recordingStartTimestamp}.csv`,
        `events_${this.recordingStartTimestamp}.csv`,
      ],
      dataSets: [
        this.rawBrainwavesSeries,
        this.powerByBandSeries,
        this.signalQualitySeries,
        this.fftSeries,
        this.accelerometerSeries,
        this.focusSeries,
        this.calmSeries,
        this.eventSeries,
      ],
    };

    try {
      await downloadDataAsZip(datasetExport, `fusionDataExport`, dayjs.unix(this.recordingStartTimestamp));
    } catch (e) {
      console.log(e);
    } finally {
      // empty series
      this.rawBrainwavesSeries = [];
      this.powerByBandSeries = [];
      this.signalQualitySeries = [];
      this.fftSeries = [];
      this.focusSeries = [];
      this.calmSeries = [];
      this.accelerometerSeries = [];
      this.eventSeries = [];
    }
  }

  /**
   * Reads data from Neurosity to memory
   * @param experiment
   * @param channelNames
   * @param duration
   */
  async startRecording(experiment: IExperiment, channelNames: string[], duration: number = 0) {
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

    /**
     * Record raw brainwaves
     */
    neurosity
      .brainwaves("raw")
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((brainwaves) => {
        // get the number of samples in each entry
        const epochData = brainwaves as Epoch;
        const samples = epochData.data[0].length;
        let index = 0;
        for (index; index < samples; index++) {
          const brainwaveEntry: any = {};
          brainwaveEntry.index = index;
          brainwaveEntry.unixTimestamp = epochData.info.startTime;

          let chIndex = 0;
          for (chIndex; chIndex < channelNames.length; chIndex++) {
            const chName = channelNames[chIndex];

            brainwaveEntry[chName] = epochData.data[chIndex][index];
          }
          this.rawBrainwavesSeries.push(brainwaveEntry);
        }
      });

    /**
     * Get power by band series
     */
    neurosity
      .brainwaves("powerByBand")
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((brainwaves) => {
        const bandPowerObject: any = {};

        bandPowerObject.unixTimestamp = dayjs().valueOf();

        // TODO: fix hack/contact neurosity team
        const powerByBand = brainwaves as unknown as PowerByBand;

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          const chName = channelNames[index];

          bandPowerObject[`${chName}_alpha`] = powerByBand.data.alpha[index];
          bandPowerObject[`${chName}_beta`] = powerByBand.data.beta[index];
          bandPowerObject[`${chName}_delta`] = powerByBand.data.delta[index];
          bandPowerObject[`${chName}_gamma`] = powerByBand.data.gamma[index];
          bandPowerObject[`${chName}_theta`] = powerByBand.data.theta[index];
        }

        this.powerByBandSeries.push(bandPowerObject);
      });

    /**
     * Get signal quality readings
     */
    neurosity
      .signalQuality()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((signalQuality) => {
        const signalQualityEntry: any = {};
        signalQualityEntry.unixTimestamp = dayjs().valueOf();

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          const chName = channelNames[index];
          signalQualityEntry[`${chName}_value`] = signalQuality[index].standardDeviation;
          signalQualityEntry[`${chName}_status`] = signalQuality[index].status;
        }

        this.signalQualitySeries.push(signalQualityEntry);
      });

    /**
     * Get psd (fft) readings
     */
    neurosity
      .brainwaves("psd")
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((brainwaves) => {
        const fftEntry: any = {};
        fftEntry.unixTimestamp = dayjs().valueOf();

        const epochData = brainwaves as PSD;

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          const chName = channelNames[index];

          fftEntry[chName] = epochData.psd[index].join(";");
        }

        this.fftSeries.push(fftEntry);
      });

    /**
     * Get accelerometer readings
     */
    neurosity
      .accelerometer()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((accelerometer) => {
        this.accelerometerSeries.push(accelerometer);
      });

    /**
     * Get focus predictions
     */
    neurosity
      .focus()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((focus) => {
        this.focusSeries.push(focus);
      });

    /**
     * Get calm predictions
     */
    neurosity
      .calm()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((calm) => {
        this.calmSeries.push(calm);
      });
  }
}

export const neurosityService = new NeurosityService();
