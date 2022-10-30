import logo from '../assets/logo.png';
import React, { useState, useEffect } from 'react';
import { Notion } from "@neurosity/notion";
import ReactEcharts from "echarts-for-react";
import Experiment from '../components/experiment';
import brainMontage from "../assets/brainmontage2.png";

export default function Root() {

    const email = process.env.REACT_APP_NEUROSITY_EMAIL;
    const password = process.env.REACT_APP_NEUROSITY_PASSWORD;
    const deviceId = process.env.REACT_APP_NEUROSITY_DEVICEID;

    const [notion, setNotion] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const [signalQualityValues, setSignalQualityValues] = useState({});
    const [signalQualityChartOptions, setSignalQualityChartOptions] = useState({});

    const [deviceStatus, setDeviceStatus] = useState("offline");

    // e.g CP3, C3, F5, PO3, PO4, F6, C4, CP4
    const [channelNames, setChannelNames] = useState([]);

    useEffect(() => {
        // it all starts with having a device id set
        // (you can save it in local storage after setting it once)
        console.log(deviceId)
        if (deviceId) {
            const notion_instance = new Notion({ 
                // deviceId: deviceId
                autoSelectDevice: false 
            });            
            setNotion(notion_instance);
        }

    }, [deviceId]);

    useEffect(() => {
        if (!notion) {
            return;
        }

        (async () => {
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
                });          
        })();

    }, [notion]);

    useEffect(() => {
        if (loggedIn && notion) {
            (async () => {
                await notion.selectDevice(["deviceId", deviceId]).then(() => {
                    console.log("selected device")
                });
            })();

            (async () => {
                // validate that the device is online
                await notion.status().subscribe(status => {
                    if(status.state != deviceStatus) {
                        let deviceState = status.state;
                        (status.sleepMode) ? deviceState = "sleep" : deviceState = status.state;
                        setDeviceStatus(deviceState)

                        if (deviceState === "online") {

                            (async () => {
                                const channelNames = (await notion.getInfo()).channelNames;
                                setChannelNames(channelNames);
                            })();
                        }

                    }
                    
                });

            })()
        }
    }, [loggedIn, notion])

    async function formatSignalQuality(signalQuality) {

        let formattedSignalQuality = {
            'unixTimestamp_secs': Math.floor(Date.now()),
        }
        for (let ch_index = 0; ch_index < channelNames.length; ch_index++) {
            let ch_name = channelNames[ch_index];
            formattedSignalQuality[ch_name + "_value"] = signalQuality[ch_index].standardDeviation;
            formattedSignalQuality[ch_name + "_status"] = signalQuality[ch_index].status;
        }
        return formattedSignalQuality;
    }

    useEffect(() => {
        if (deviceStatus == "online") {
            // connect to live feed of signal quality
            (async () => {
                await notion.signalQuality().subscribe(signalQuality => {
                    (async () => await formatSignalQuality(signalQuality).then(
                        (formattedSignalQuality) => {
                            setSignalQualityValues(formattedSignalQuality)
                        })
                    )();
                });
            })();
        }
    }, [deviceStatus, channelNames]);

    useEffect(() => {
        
        const valueData = [];
        for (let i = 0; i < channelNames.length; i++) {
          valueData.push(signalQualityValues[channelNames[i] + "_value"]);
        }

        // TODO: average over longer data window
        // (e.g. 10 seconds) and update chart every 10 seconds

        // get the chart series and generate options
        const option = {   
            title: {
                text: 'Signal Quality over time',
            },
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
    }, [deviceStatus, signalQualityValues])

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

            <p>Your device is: <strong>{deviceStatus}</strong></p>

            {deviceStatus == "online" && signalQualityValues ? (
                <div id="signalquality">
                    <h2>Signal Quality</h2>
                    {/* chart for data quality ranges */}
                    {/* <p>Signal quality is {JSON.stringify(signalQualityValues)}</p> */}
                    
                    <div id="sidebars">
                        <div>
                            {/* add image of brain montage */}
                            <img src={brainMontage} alt="brain montage" width={500} />
                        </div>

                        <div>
                            <ReactEcharts option={signalQualityChartOptions} />
                        </div> 

                        <p>
                        Signal quality thresholds: bad >= 15, good >= 10, great >= 1.5
                        </p>                      
                    </div>
                    

                    {/* display what is good quality vs not good */}
                    {/* custom gradient for groups */}
                </div>
            ) : <> </>
            }

            {deviceId ? (
                <div id="record-experiment">
                    <h2>Experiments</h2>
                        <div>
                            <p>You need to be logged in to record an experiment</p>
                        </div>
                    <ul>
                        <li>
                            <Experiment
                                name="Generic Experiment"
                                text="Record brain activity for a defined duration">    
                            </Experiment>
                        </li>
                    </ul>
                </div>
            ) : (
                <></>
            )}

        </>
    );
}