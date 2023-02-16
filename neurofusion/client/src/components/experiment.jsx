import React, { useState, useEffect, startTransition } from "react";
import Timer from "./timer";

import { timer } from "rxjs";
import { takeUntil } from "rxjs/operators/index.js";
import axios from "axios";

import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

import "react-notifications/lib/notifications.css";

export default function Experiment({
  name,
  description,
  duration,
  notion,
  channelNames,
}) {
  const [recordingDuration, setRecordingDuration] = useState(-1); // in seconds;
  const [recordingStatus, setRecordingStatus] = useState("stopped"); // started, stopped

  const [eventDescription, setEventDescription] = useState("");
  const handleEventDescriptionChange = (event) => {
    setEventDescription(event.target.value);
  };

  useEffect(() => {
    setRecordingDuration(duration);
  }, [duration]);

  function startRecording() {
    // record raw data
    alert("starting recording");
    // invoke all the subscriptions
    let fileTimestamp = Math.floor(Date.now() / 1000);

    setRecordingStatus("started"); // started, stopped

    if (notion) {
      console.log("notion initialized, starting recording");
      /**
       * Record raw brainwaves
       */
      let rawBrainwavesSeries = [];
      notion
        .brainwaves("raw")
        .pipe(
          takeUntil(
            timer(recordingDuration * 1000) // in milliseconds
          )
        )
        .subscribe((brainwaves) => {
          // get the number of samples in each entry
          let samples = brainwaves.data[0].length;
          let index = 0;
          for (index; index < samples; index++) {
            let brainwaveEntry = {};
            brainwaveEntry["index"] = index;
            brainwaveEntry["unixTimestamp"] = brainwaves.info.startTime;

            let ch_index = 0;
            for (ch_index; ch_index < channelNames.length; ch_index++) {
              let ch_name = channelNames[ch_index];

              brainwaveEntry[ch_name] = brainwaves.data[ch_index][index];
            }

            rawBrainwavesSeries.push(brainwaveEntry);
          }
        })
        .add(() => {
          // now we want to have this downloaded right away
          writeDataToStore(
            "rawBrainwaves",
            rawBrainwavesSeries,
            fileTimestamp,
            "remoteStorage"
          );
        });

      /**
       * Get signal quality readings
       */
      let signalQualitySeries = [];
      notion
        .signalQuality()
        .pipe(
          takeUntil(
            timer(recordingDuration * 1000) // in milliseconds
          )
        )
        .subscribe((signalQuality) => {
          let signalQualityEntry = {
            unixTimestamp: Math.floor(Date.now() / 1000),
          };

          // loop to get a single entry containing power from all channels
          let index = 0;
          for (index; index < channelNames.length; index++) {
            let ch_name = channelNames[index];
            signalQualityEntry[ch_name + "_value"] =
              signalQuality[index].standardDeviation;
            signalQualityEntry[ch_name + "_status"] =
              signalQuality[index].status;
          }

          signalQualitySeries.push(signalQualityEntry);
        })
        .add(() => {
          writeDataToStore(
            "signalQuality",
            signalQualitySeries,
            fileTimestamp,
            "remoteStorage"
          );
        });

      /**
       * Subscribe to focus metrics
       */
      let focusPredictionSeries = [];
      notion
        .focus()
        .pipe(
          takeUntil(
            timer(recordingDuration * 1000) // in milliseconds
          )
        )
        .subscribe((focus) => {
          focusPredictionSeries.push(focus);
        })
        .add(() => {
          writeDataToStore(
            "focus",
            focusPredictionSeries,
            fileTimestamp,
            "remoteStorage"
          );
        });

      /**
       * Subscribe to focus metrics
       */
      let calmPredictionSeries = [];
      notion
        .calm()
        .pipe(
          takeUntil(
            timer(recordingDuration * 1000) // in milliseconds
          )
        )
        .subscribe((calm) => {
          calmPredictionSeries.push(calm);
        })
        .add(() => {
          writeDataToStore(
            "calm",
            calmPredictionSeries,
            fileTimestamp,
            "remoteStorage"
          );
        });

      /**
       * Get power by band series
       */
      let powerByBandSeries = [];
      notion
        .brainwaves("powerByBand")
        .pipe(
          takeUntil(
            timer(recordingDuration * 1000) // in milliseconds
          )
        )
        .subscribe((brainwaves) => {
          let bandPowerObject = {
            unixTimestamp: Math.floor(Date.now() / 1000),
          };

          // loop to get a single entry containing power from all channels
          let index = 0;
          for (index; index < channelNames.length; index++) {
            let ch_name = channelNames[index];

            bandPowerObject[ch_name + "_alpha"] = brainwaves.data.alpha[index];
            bandPowerObject[ch_name + "_beta"] = brainwaves.data.beta[index];
            bandPowerObject[ch_name + "_delta"] = brainwaves.data.delta[index];
            bandPowerObject[ch_name + "_gamma"] = brainwaves.data.gamma[index];
            bandPowerObject[ch_name + "_theta"] = brainwaves.data.theta[index];
          }

          powerByBandSeries.push(bandPowerObject);
        })
        .add(() => {
          writeDataToStore(
            "powerByBand",
            powerByBandSeries,
            fileTimestamp,
            "remoteStorage"
          );
        });
    }

    //  generate the and upload to storage
    let event = {
      startTimestamp: fileTimestamp,
      event: {
        name: name,
        description: eventDescription,
        value: eventDescription,
      },
    };
    // upload event metadata
    writeDataToStore("event", event, fileTimestamp, "remoteStorage");
  }

  function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr);

    return array
      .map((it) => {
        return Object.values(it).toString();
      })
      .join("\n");
  }

  function writeDataToStore(
    dataName,
    data,
    fileTimestamp,
    storeType = "download"
  ) {
    setRecordingStatus("stopped");

    // TODO: fix validation
    console.log("fileTimestamp: ", fileTimestamp);

    const timestampLength = fileTimestamp.toString().length;
    if (timestampLength != 10 && timestampLength != 13) {
      console.log("fileTimestamp must be in seconds or milliseconds");
      return;
    }

    // convert to milliseconds if in seconds
    const recordingDate =
      timestampLength == 10
        ? new Date(fileTimestamp * 1000)
        : new Date(fileTimestamp);

    const providerName = dataName == "event" ? "fusion" : "neurosity";

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
        const res = await axios.post(
          `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/upload`,
          {
            provider: providerName,
            dataName: dataName,
            fileTimestamp: fileTimestamp,
            content: data,
          }
        );

        if (res.status == 200) {
          NotificationManager.success(`uploading ${dataName} successful`);
          console.log(`Writing data for ${dataName} complete`);
        } else {
          NotificationManager.error(`uploading ${dataName} failed`);
          console.log(`Writing data for ${dataName} failed`);
        }
      })();
    }
  }

  const handleChange = (event) => {
    const value = event.target.value;
    setRecordingDuration(value);
  };

  return (
    <>
      <h3>{name}</h3>
      <p>{description}</p>

      <label htmlFor="event_description">
        Description of what you're doing:
      </label>
      <textarea
        id="event_description"
        value={eventDescription}
        onChange={handleEventDescriptionChange}
        placeholder="e.g eyes closed, listening to music"
      ></textarea>

      <div>
        Recording time in seconds :
        <input
          type="number"
          value={recordingDuration}
          placeholder="2"
          onChange={handleChange}
        ></input>
      </div>

      <div>
        {recordingStatus == "started" ? (
          <p>
            Time left: <Timer delayResend={recordingDuration}></Timer>
          </p>
        ) : null}

        {recordingStatus == "stopped" ? (
          <button class="button" onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <button class="button" disabled={true}>
            Recording in progress...
          </button>
        )}
      </div>

      <NotificationContainer />
    </>
  );
}
