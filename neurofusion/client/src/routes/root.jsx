import logo from '../assets/logo.png';
import React, { useState, useEffect } from 'react';
import { Notion } from "@neurosity/notion";
import ReactEcharts from "echarts-for-react";

export default function Root() {

    const email = process.env.REACT_APP_NEUROSITY_EMAIL;
    const password = process.env.REACT_APP_NEUROSITY_PASSWORD;
    const deviceId = process.env.REACT_APP_NEUROSITY_DEVICEID;

    const [notion, setNotion] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    // const [signalQualitySeries, setSignalQualitySeries] = useState({});
    const [signalQualityValues, setSignalQualityValues] = useState({});

    const [signalQualityChartOptions, setSignalQualityChartOptions] = useState({});

    // e.g CP3, C3, F5, PO3, PO4, F6, C4, CP4
    const [channelNames, setChannelNames] = useState([]);

    useEffect(() => {
        // it all starts with having a device id set
        // (you can save it in local storage after setting it once)
        console.log(deviceId)
        if (deviceId) {
            const notion_instance = new Notion({ deviceId });            
            setNotion(notion_instance);

            // TODO:validate that the device login is valid
        }

    }, [deviceId]);


    useEffect(() => {
        if (!notion) {
            return;
        }

        login()

        async function login() {
            await notion
                .login({
                    email,
                    password
                }).then(() => {
                    console.log("connected to neurosity")
                    setLoggedIn(true)
                }).catch((error) => {
                    console.log("failed to connect to neurosity")
                    console.log(error)
                })

        }

    }, [notion]);

    useEffect(() => {
        console.log(loggedIn)
        if (loggedIn && notion) {

            (async () => {
                const channelNames = (await notion.getInfo()).channelNames;
                setChannelNames(channelNames);
            })();

            // connect to live feed of signal quality
            notion.signalQuality().subscribe(signalQuality => {

                let signalQualityEntry = {
                    'unixTimestamp_secs': Math.floor(Date.now() / 1000),
                }

                // change value after every 10 seconds
                if (signalQualityEntry.unixTimestamp_secs % 5 == 0) {
                    console.log("formatting signal quality entry");

                    for (let ch_index = 0; ch_index < channelNames.length; ch_index++) {

                        let ch_name = channelNames[ch_index];
                        signalQualityEntry[ch_name + "_value"] = signalQuality[ch_index].standardDeviation;
                        signalQualityEntry[ch_name + "_status"] = signalQuality[ch_index].status;

                    }

                    console.log("updating signal quality average")
                    setSignalQualityValues(signalQualityEntry)
                    console.log(signalQualityEntry)
                }
            });
        }

    }, [loggedIn, notion])

    useEffect(() => {
        
        const valueData = [];
        for (let i = 0; i < channelNames.length; i++) {
          valueData.push(signalQualityValues[channelNames[i] + "_value"]);
        }
        // get the chart series and generate options
        const option = {   
            grid: { containLabel: true },
            xAxis: {
                name: "channelName",
                data: channelNames,
                type: "category",
            },
            yAxis: { name: 'signalQualityValue', type: 'value' },
            series: [
                {
                    data: valueData,
                    type: "bar",
                },
            ],
        };
        setSignalQualityChartOptions(option)
    }, [signalQualityValues])

    function genericExperiment() {
        // record raw data
        alert("starting generic experiment")
    }

    function dinoExperiment() {
        // play game
        alert("starting dino experiment")
    }

    return (
        <>
            <div id="sidebar">
                <img src={logo} className="App-logo" alt="logo" width={100} height={100} />

                <h1>neurofusion</h1>
                <p>..for the curious</p>
            </div>

            <div id="devices">
                {/* select box to choose device */}
            </div>

            {loggedIn && signalQualityValues ? (
                <div id="signalquality">
                    <h2>Signal Quality</h2>
                    {/* chart for data quality ranges */}
                    <p>Signal quality is {JSON.stringify(signalQualityValues)}</p>

                    <ReactEcharts option={signalQualityChartOptions} />
                </div>
            ) :
                <></>
            }


            {loggedIn ? (
                <div id="record-experiment">
                    <h2>Experiments</h2>
                    <ul>
                        <li><button onClick={genericExperiment}>Generic Experiment</button></li>
                        <li><button onClick={dinoExperiment}>Play dino game!</button></li>
                    </ul>
                </div>
            ) : (
                <div>
                    <p>You need to be logged in to record an experiment</p>
                </div>
            )}

        </>
    );
}