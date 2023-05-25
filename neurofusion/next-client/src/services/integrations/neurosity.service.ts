import { api } from "~/config";
import { Neurosity } from "@neurosity/sdk";
import { Epoch, PSD, PowerByBand } from "@neurosity/sdk/dist/esm/types/brainwaves";

import dayjs from "dayjs";
import axios from "axios";

import { interval, fromEvent, takeUntil, takeWhile } from "rxjs";

export const neurosity = new Neurosity({
  autoSelectDevice: false,
});

class NeurosityService {
  rawBrainwavesSeries: any = [];
  powerByBandSeries: any = [];
  signalQualitySeries: any = [];
  fftSeries: any = [];
  focusSeries: any = [];
  calmSeries: any = [];
  accelerometerSeries: any = [];

  recordingStatus: "not-started" | "started" | "stopped" = "not-started";

  recordingStartTimestamp: number = 0;

  async stopRecording() {
    this.recordingStatus = "stopped";
  }

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
        let epochData = brainwaves as Epoch;
        let samples = epochData.data[0].length;
        let index = 0;
        for (index; index < samples; index++) {
          let brainwaveEntry: any = {};
          brainwaveEntry["index"] = index;
          brainwaveEntry["unixTimestamp"] = epochData.info.startTime;

          let ch_index = 0;
          for (ch_index; ch_index < channelNames.length; ch_index++) {
            let ch_name = channelNames[ch_index];

            brainwaveEntry[ch_name] = epochData.data[ch_index][index];
          }
          this.rawBrainwavesSeries.push(brainwaveEntry);
        }
      })
      .add(() => {
        console.log("stopped recording");
        writeDataToStore(
          "rawBrainwaves",
          this.rawBrainwavesSeries,
          this.recordingStartTimestamp.toString(),
          "download"
        );
      });

    /**
     * Get power by band series
     */
    neurosity
      .brainwaves("powerByBand")
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((brainwaves) => {
        let bandPowerObject: any = {};

        bandPowerObject["unixTimestamp"] = dayjs().valueOf();

        let powerByBand = brainwaves as PowerByBand;

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          let ch_name = channelNames[index];

          console.log("index", index);
          console.log(powerByBand);

          bandPowerObject[ch_name + "_alpha"] = powerByBand.data.alpha[index];
          bandPowerObject[ch_name + "_beta"] = powerByBand.data.beta[index];
          bandPowerObject[ch_name + "_delta"] = powerByBand.data.delta[index];
          bandPowerObject[ch_name + "_gamma"] = powerByBand.data.gamma[index];
          bandPowerObject[ch_name + "_theta"] = powerByBand.data.theta[index];
        }

        this.powerByBandSeries.push(bandPowerObject);
      })
      .add(() => {
        console.log("stopped recording powerByBand");
        writeDataToStore("powerByBand", this.powerByBandSeries, this.recordingStartTimestamp.toString(), "download");
      });

    /**
     * Get signal quality readings
     */
    neurosity
      .signalQuality()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((signalQuality) => {
        let signalQualityEntry: any = {};
        signalQualityEntry["unixTimestamp"] = dayjs().valueOf();

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          let ch_name = channelNames[index];
          signalQualityEntry[ch_name + "_value"] = signalQuality[index].standardDeviation;
          signalQualityEntry[ch_name + "_status"] = signalQuality[index].status;
        }

        this.signalQualitySeries.push(signalQualityEntry);
      })
      .add(() => {
        console.log("stopped recording signalQuality");
        writeDataToStore(
          "signalQuality",
          this.signalQualitySeries,
          this.recordingStartTimestamp.toString(),
          "download"
        );
      });

    /**
     * Get psd (fft) readings
     */
    neurosity
      .brainwaves("psd")
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((brainwaves) => {
        let fftEntry: any = {};
        fftEntry["unixTimestamp"] = dayjs().valueOf();

        let epochData = brainwaves as PSD;

        // loop to get a single entry containing power from all channels
        let index = 0;
        for (index; index < channelNames.length; index++) {
          let ch_name = channelNames[index];

          fftEntry[ch_name] = epochData.psd[index].join(";");
        }

        this.fftSeries.push(fftEntry);
      })
      .add(() => {
        console.log("stopped recording fft");
        writeDataToStore("psd", this.fftSeries, this.recordingStartTimestamp.toString(), "download");
      });

    /**
     * Get accelerometer readings
     */
    neurosity
      .accelerometer()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((accelerometer) => {
        this.accelerometerSeries.push(accelerometer);
      })
      .add(() => {
        console.log("stopped recording accelerometer");
        writeDataToStore(
          "accelerometer",
          this.accelerometerSeries,
          this.recordingStartTimestamp.toString(),
          "download"
        );
      });

    /**
     * Get focus predictions
     */
    neurosity
      .focus()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((focus) => {
        this.focusSeries.push(focus);
      })
      .add(() => {
        console.log("stopped recording focus");
        writeDataToStore("focus", this.focusSeries, this.recordingStartTimestamp.toString(), "download");
      });

    /**
     * Get calm predictions
     */
    neurosity
      .calm()
      .pipe(takeWhile(() => this.recordingStatus === "started"))
      .subscribe((calm) => {
        this.calmSeries.push(calm);
      })
      .add(() => {
        console.log("stopped recording calm");
        writeDataToStore("calm", this.calmSeries, this.recordingStartTimestamp.toString(), "download");
      });
  }
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

    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(content);
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  } else if (storeType === "remoteStorage") {
    // call the upload api
    (async () => {
      const res = await axios.post(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/upload`, {
        provider: providerName,
        dataName: dataName,
        fileTimestamp: fileTimestamp,
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
