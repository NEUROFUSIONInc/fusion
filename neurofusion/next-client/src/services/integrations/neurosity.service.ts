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

  // eventName = "";
  // eventDescription = "";
  // eventTags: string[] = [];

  // constructor(eventName: string, eventDescription: string, eventTags: string[]) {
  //   this.eventName = eventName;
  //   this.eventDescription = eventDescription;
  //   this.eventTags = eventTags;
  // }

  // datastorage mode, fetch from localstorage...
  dataStorageMode = "local"; // local | remote

  recordingStatus: "not-started" | "started" | "stopped" = "not-started";

  recordingStartTimestamp = 0;

  async stopRecording() {
    this.recordingStatus = "stopped";

    // call the download data as zip function
    const datasetExport: DatasetExport = {
      fileNames: [
        "rawBrainwaves.csv",
        "powerByBand.csv",
        "signalQuality.csv",
        "psd.csv",
        "accelerometer.csv",
        "focus.csv",
        "calm.csv",
      ],
      dataSets: [
        this.rawBrainwavesSeries,
        this.powerByBandSeries,
        this.signalQualitySeries,
        this.fftSeries,
        this.accelerometerSeries,
        this.focusSeries,
        this.calmSeries,
      ],
    };

    try {
      console.log("exporting");
      await downloadDataAsZip(datasetExport, `fusionExport`, dayjs.unix(this.recordingStartTimestamp));
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
    }
  }

  // todo: log event to app insights
  async startRecording(channelNames: string[]) {
    this.recordingStartTimestamp = dayjs().unix();

    console.log("starting recording");
    this.recordingStatus = "started";

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

export interface DatasetExport {
  fileNames: string[];
  dataSets: Array<any>;
}

async function downloadDataAsZip(datasetExport: DatasetExport, zipFileName: string, unixTimestamp: dayjs.Dayjs) {
  const filePath = `${unixTimestamp.unix()}_${zipFileName}.zip`;

  let zip = new JSZip();
  for (let i = 0; i < datasetExport.dataSets.length; i++) {
    const dataSet = datasetExport.dataSets[i];
    const content = convertToCSV(dataSet); // convert to csv format
    zip.file(datasetExport.fileNames[i], content);
  }

  // download the zip file
  const downloadLink = document.createElement("a");
  const blob = await zip.generateAsync({ type: "blob" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filePath}`;
  downloadLink.click();
}

function convertToCSV(arr: any[]) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
}

function writeDataToStore(dataName: string, data: any, fileTimestamp: string, storeType = "download") {
  // TODO: fix validation
  console.log("fileTimestamp: ", fileTimestamp);

  const providerName = dataName === "event" ? "fusion" : "neurosity";

  if (storeType === "download") {
    const fileName = `${dataName}_${fileTimestamp}.csv`;
    const content = convertToCSV(data); // convert to csv format

    const hiddenElement = document.createElement("a");
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(content)}`;
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  } else if (storeType === "remoteStorage") {
    // call the upload api
    (async () => {
      const res = await axios.post(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/upload`, {
        provider: providerName,
        dataName: dataName, // eslint-disable-line object-shorthand
        fileTimestamp: fileTimestamp, // eslint-disable-line object-shorthand
        content: data,
      });

      if (res.status === 200) {
        // NotificationManager.success(`uploading ${dataName} successful`);
        console.log(`Writing data for ${dataName} complete`);
      } else {
        // NotificationManager.error(`uploading ${dataName} failed`);
        console.log(`Writing data for ${dataName} failed`);
      }
    })();
  }
}

export const neurosityService = new NeurosityService();
