import React, { useState, useEffect } from "react";

import ReactEcharts from "echarts-for-react";
import { neurosityService, neurosity } from "~/services";

export default function SignalQuality({ channelNames, deviceStatus }) {
  const [signalQualityArray, setSignalQualityArray] = useState([]);
  const [signalQualityValues, setSignalQualityValues] = useState({});
  const [signalQualityChartOptions, setSignalQualityChartOptions] = useState({});

  // feed signal quality values into array
  useEffect(() => {
    if (deviceStatus === "online") {
      const subscribeToLiveFeed = async () => {
        await neurosity.signalQuality().subscribe(async (signalQuality) => {
          setSignalQualityArray((sigArray) => [...sigArray, signalQuality]);
        });
      };
      subscribeToLiveFeed();
    }
  }, [deviceStatus]);

  // average after every 50 samples
  useEffect(() => {
    if (signalQualityArray.length >= 10) {
      (async () => {
        const avgSigQuality = await averageSignalQuality(signalQualityArray);
        setSignalQualityValues(avgSigQuality);
        // empty the array
        setSignalQualityArray([]);
      })();
    }
  }, [signalQualityArray]);

  // update chart options when signal quality values change
  useEffect(() => {
    const valueData = [];
    for (let i = 0; i < channelNames.length; i++) {
      valueData.push(signalQualityValues[channelNames[i] + "_value"]);
    }

    const option = {
      grid: { containLabel: true },
      xAxis: {
        name: "channelName",
        data: channelNames,
        type: "category",
      },
      yAxis: { name: "signalQualityValue", type: "value" },
      series: [
        {
          data: valueData,
          type: "bar",
          itemStyle: {
            color: function (params) {
              if (params.value >= 15) {
                // bad
                return "red";
              } else if (params.value >= 10) {
                // good
                return "yellow";
              } else if (params.value >= 1.5) {
                // great
                return "green";
              } else {
                // no contact
                return "grey";
              }
            },
          },
        },
      ],
    };
    setSignalQualityChartOptions(option);
  }, [signalQualityValues]);

  // helper functions
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  async function formatSignalQuality(signalQuality) {
    let formattedSignalQuality = {};

    for (let ch_index = 0; ch_index < channelNames.length; ch_index++) {
      let ch_name = channelNames[ch_index];
      formattedSignalQuality[ch_name + "_value"] = signalQuality[ch_index].standardDeviation;
    }
    return formattedSignalQuality;
  }

  async function formatSignalQualityArray(signalQualityArray) {
    let formattedSignalQualityArray = [];
    for (let i = 0; i < signalQualityArray.length; i++) {
      await formatSignalQuality(signalQualityArray[i]).then((formattedSignalQuality) => {
        formattedSignalQualityArray.push(formattedSignalQuality);
      });
    }
    return formattedSignalQualityArray;
  }

  async function averageSignalQuality(signalQualityArray) {
    const averageSignalQuality = {};
    const formattedSignalQualityArray = await formatSignalQualityArray(signalQualityArray);
    for (var channel in channelNames) {
      let channelName = channelNames[channel];
      let channelValues = formattedSignalQualityArray.map((sample) => sample[channelName + "_value"]).filter(isNumber);
      let channelAverage = channelValues.reduce((a, b) => a + b, 0) / channelValues.length;
      averageSignalQuality[channelName + "_value"] = channelAverage;
    }
    return averageSignalQuality;
  }

  let montageStyle = {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div id="signalquality">
      <div id="sidebars" style={{ display: "flex" }}>
        <div style={{ width: "50%", textAlign: "center" }}>
          <ReactEcharts option={signalQualityChartOptions} />

          <p>
            Signal quality thresholds:{" "}
            <strong>Great: between 1.5 and 10, Good: between 10 and 15, Poor: over 15</strong>
          </p>
          <p>Sit still for about 10 seconds after adjusting to see signal average</p>
        </div>
      </div>
    </div>
  );
}
