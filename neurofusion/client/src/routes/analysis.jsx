import React, { useState, useEffect, useRef } from "react";
import SideNavBar from "../components/sidenavbar";
import * as echarts from "echarts/lib/echarts";
import { Dropdown, Slider } from "@fluentui/react";

// import magicFlowContexts from "../assets/magicflow_contexts_clean_dec_11.json"
// import neurosityFocus from "../assets/neurosity_focus_clean_dec_11.json"
// import magicFlowRawEvents from "../assets/magicflow_raw_events_clean_dec_11.json"

import { useNeurofusionUser } from "../services/auth";
import axios from "axios"


export default function Analysis() {
  const neurofusionUserInfo = useNeurofusionUser();

  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedFrequencyBands, setSelectedFrequencyBands] = useState([]);
  const [stdDevThreshold, setStdDevThreshold] = useState(15);

  const [brainChart, setBrainChart] = useState(null);
  const brainChartRef = useRef(null);
  const [brainChartOptions, setBrainChartOptions] = useState({});

  const channelNames = ["CP3", "C3", "F5", "PO3", "PO4", "F6", "C4", "CP4"];

  const [startDate, setStartDate] = useState(new Date((new Date).getTime() - (1 * 24 * 60 * 60 * 1000)).toLocaleDateString());

  const [powerSpectrumData, setPowerSpectrumData] = useState([]);
  const [magicFlowContexts, setMagicFlowContexts] = useState([]);

  const frequencyBands = [
    { key: "delta", text: "Delta" },
    { key: "theta", text: "Theta" },
    { key: "alpha", text: "Alpha" },
    { key: "beta", text: "Beta" },
    { key: "gamma", text: "Gamma" },
  ];

  // fetch the power spectrum & magicflow contexts data
  useEffect(() => {
    // console.log('startDate', startDate)
    // console.log('endDate', endDate)
    if(startDate === "") {
      return;
    }

    // TODO: check if values are in the right format
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = (new Date(startDate).getTime() + (1 * 24 * 60 * 60 * 1000)) / 1000;


    // make call to backend to get available blobs for time period - eegPowerSpectrum
    async function fetchData() {
      const res = await axios.get(
        `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/search`,
        {
          params: {
            userGuid: localStorage.getItem("userGuid"), // this should be from backend
            dataName: "eegPowerSpectrum",
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            provider: "fusion"
          }
        }
      );

      if (res.status === 200) {
        console.log(res.data);
        let mergedDataset = [];
        // now go through the list of blobs and read them
        const blobNames = res.data.blobNames;
        for (let i=0; i < blobNames.length; i++) {
          const res = await axios.get(
            `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/get`,
            {
              params: {
                blobName: blobNames[i],
              }
            }
          );

          if (res.status === 200) {
            console.log("merging single response into combined dataset")
            mergedDataset = mergedDataset.concat(eval(res.data));
          } else {
            console.log("request unsucessful");
            console.log(res);
          }
        }

        console.log("merged powerSpectrum dataset", mergedDataset);
        setPowerSpectrumData(mergedDataset);

      } else {
        console.log("request unsucessful");
        console.log(res);
      }
    }

    // make call to backend to get available blobs for time period - magicflow
    async function fetchMagicflowEvents() {
      const res = await axios.get(
        `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/search`,
        {
          params: {
            userGuid: localStorage.getItem("userGuid"), // this should be from backend
            dataName: "activitywatch",
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            provider: "magicflow"
          }
        }
      );

      if (res.status === 200) {
        // fetch the magicflow datasets for timestamp
        let mergedEventsDataset = [];
        let mergedContextsDataset = [];

        const blobNames = res.data.blobNames;
        for (let i=0; i < blobNames.length; i++) {
          const res = await axios.get(
            `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/get`,
            {
              params: {
                blobName: blobNames[i]
              }
            }
          );

          if (res.status === 200) {
            console.log("Merging the contexts")
            mergedContextsDataset = mergedContextsDataset.concat(eval(res.data.productivityMetrics.contexts));
          } else {
            console.log("request unsucessful");
            console.log(res);
          }
        }

        console.log("merged contexts dataset", mergedContextsDataset);
        setMagicFlowContexts(mergedContextsDataset);

      } else {
        console.log("request unsucessful");
        console.log(res);
      }
    }

    try {
      fetchData();
      fetchMagicflowEvents();
    } catch (err) {
      console.log(err);
    }

  }, [startDate])

  // initialize brain power chart
  useEffect(() => {
    // only intialize the chart once
    if (brainChartRef.current && brainChart == null) {
      setBrainChart(echarts.init(brainChartRef.current));
    }

    if (brainChart) {
      brainChart.setOption(brainChartOptions, true);
    }
  }, [brainChart, brainChartOptions]);


  // update brain power chart when selectors change
  useEffect(() => {
    // console.log('selectedChannels', selectedChannels)
    // console.log('selectedFrequencyBands', selectedFrequencyBands)
    if (selectedChannels.length > 0 && selectedFrequencyBands.length > 0) {
      (async () => {
        setBrainChartOptions(
          await updateBrainChartOptions(
            selectedChannels[0],
            selectedFrequencyBands,
            stdDevThreshold
          )
        );
      })();
    }
  }, [powerSpectrumData, magicFlowContexts, selectedChannels, selectedFrequencyBands, stdDevThreshold]);

  async function updateBrainChartOptions(
    channelName,
    frequencyBands,
    stdDevThreshold = 15
  ) {
    /**
     * @param {string} channelName
     * @returns {object} chartOptions
     * @description
     * This function takes in a channel name and returns the chart options
     * for that channel.
     */

    const yAxisName = `${channelName} ${frequencyBands} Power (uV^2/Hz)`;
    const xAxisName = "Time";

    const seriesData = [];
    const legendData = [];
    frequencyBands.forEach((frequencyBand) => {
      const powerSpectrumSeries = powerSpectrumData.map((item) => {
        // filter for only good channels
        if (item[`${channelName}_${frequencyBand}`] <= stdDevThreshold) {
          return [
            item.unixTimestamp,
            item[`${channelName}_${frequencyBand}_moving_avg`],
          ];
        }
      });

      // TODO: add vertical lines for magicflow contexts
      const verticalLinesData = magicFlowContexts.map((item) => {
        return {
          name: item.categories[0],
          xAxis: item.timestamp,
          lineStyle: {
            type: "dotted",
            color: item.focus ? "green" : "red",
          },
        };
      });

      const dataLabel = `${channelName} ${frequencyBand} power`;
      legendData.push(dataLabel);
      seriesData.push({
        name: dataLabel,
        type: "line",
        smooth: true,
        smoothMonotone: "x",
        data: powerSpectrumSeries,
        symbol: "none",
        lineStyle: {
          width: 2,
        },
        markLine: {
          label: {
              show: true,
              formatter: '{b}',
              interval: 0,
              rotate: 45,
              fontFamily: "Expletus Sans",
          },
          symbol: 'none',
          data: verticalLinesData
        }
      });
    });

    const chartTextStyle = {
      color: "white",
      fontFamily: "Expletus Sans",
    };

    const options = {
      title: {
        text: `Brain Power Over Time`,
        textStyle: chartTextStyle,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      xAxis: {
        type: "time",
        name: xAxisName,
        splitLine: {
          // show: true,
        },
        gap: true,
        breakArea: {
          areaStyle: {
            color: "red",
          },
        }
      },
      yAxis: {
        type: "value",
        name: yAxisName,
        splitLine: {
          show: true,
        },
        min: 0,
        max: 10,
      },
      series: seriesData,
      legend: {
        type: "scroll",
        orient: "vertical",
        right: 10,
        data: legendData,
        textStyle: chartTextStyle,
      },
      dataZoom: [
        {
          id: "dataZoomX",
          type: "slider",
          xAxisIndex: [0],
          filterMode: "filter",
        },
      ],
    };

    return options;
  }

  return (
    <>
      {neurofusionUserInfo.isLoggedIn == true ? (
        <>
          <SideNavBar></SideNavBar>

          <main
            style={{
              marginLeft: "12%",
              padding: "0 10px",
            }}
          >
            <p>
              Correlating your brain activity with health & productivity signals
            </p>

            {/* <>Add controls for selecting data type first default to powerSpectrum over time</> */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              {/* Time picker */}
              <div style={{
                display: "flex",
                flexDirection: "column",
              }}>
                <label>Day:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {/* <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                /> */}
              </div>

              {/* channel pickers */}
              <Dropdown
                label="Channel Picker"
                selectedKey={selectedChannels[0]}
                onChange={(event, option) => {
                  setSelectedChannels([option.key]);
                }}
                placeholder="Select a channel"
                options={channelNames.map((channelName) => {
                  return { key: channelName, text: channelName };
                })}
                calloutProps={{ doNotLayer: true }}
                styles={{
                  label: {
                    color: "white",
                  },
                }}
              />

              {/* selecting frequency bands to display */}
              <Dropdown
                placeholder="Select Frequency Bands"
                label="Frequency Bands"
                selectedKeys={selectedFrequencyBands}
                multiSelect
                options={frequencyBands}
                onChange={(event, option) => {
                  console.log(option);
                  setSelectedFrequencyBands(
                    option.selected
                      ? [...selectedFrequencyBands, option.key]
                      : selectedFrequencyBands.filter(
                          (item) => item !== option.key
                        )
                  );
                }}
                styles={{
                  label: {
                    color: "white",
                  },
                }}
              />

              {/* TODO: Select whether absolute value / relative value / rolling average */}

              {/* signal quality threshold */}
              <Slider
                label="Signal Quality Threshold (standard deviation)"
                max={20}
                value={stdDevThreshold}
                showValue
                // eslint-disable-next-line react/jsx-no-bind
                onChange={(value) => {
                  setStdDevThreshold(value);
                }}
                styles={{
                  titleLabel: {
                    color: "white",
                  },
                  valueLabel: {
                    color: "white",
                  },
                }}
              />
            </div>

            {/* TODO: display the label for the recorded time period */}
            <div
              ref={brainChartRef}
              style={{ height: "500px", width: "100%", paddingTop: "20px" }}
            ></div>

            {/* TODO: add "overlay" for another dataset e.g productivity */}
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
