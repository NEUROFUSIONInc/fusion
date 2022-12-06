import React, { useState, useEffect } from 'react';
import { Notion } from "@neurosity/notion";
import ReactEcharts from "echarts-for-react";
import Experiment from '../components/experiment';
import brainMontage from "../assets/brainmontage2.png";
import SelfSample from '../components/selfsample';
import SideNavBar from '../components/sidenavbar';

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
                text: 'Live signal quality feed',
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

    let montageStyle = 
    {display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"};
    
    return (
        <>
            <SideNavBar></SideNavBar>
            
            <main style={{marginLeft: '10%'}}>
                <div id="devices">
                    {/* select box to choose device */}
                </div>

                <p>Your device is: <strong>{deviceStatus}</strong></p>

                {deviceStatus == "online" && signalQualityValues ? (
                    <div id="signalquality">
                        <h2>Signal Quality</h2>
                        {/* chart for data quality ranges */}
                        {/* <p>Signal quality is {JSON.stringify(signalQualityValues)}</p> */}
                        
                        <div id="sidebars" style={{display: 'flex'}}>
                        
                            <div style={{width: '50%', textAlign: 'center'}}>
                                <ReactEcharts option={signalQualityChartOptions} />

                                <p>Signal quality thresholds: <strong>bad >= 15, good >= 10, great >= 1.5</strong></p>
                                <p>Sit still for about 10 seconds to see signal average</p>
                            </div>

                            <div style={montageStyle}>
                                {/* add image of brain montage */}
                                <img src={brainMontage} alt="brain montage" width={'700px'} />                    
                            </div>
                        
                        </div>
                        
                        {/* display what is good quality vs not good */}
                        {/* custom gradient for groups */}
                    </div>
                ) : <> </>
                }
                
                <SelfSample />
                
                <div id="record-experiment">
                    <h2>Experiments</h2>

                    {deviceStatus != "online" ? (
                        <div>
                            <p>You need to be logged in to record an experiment</p>
                        </div>
                    ) : 
                        <>
                            <p>After every experiment, you get 5 files downloaded automatically</p>
                            <ul>
                                <li>raw eeg brain waves</li>
                                <li>raw signal quality values</li>
                                <li>focus predictions</li>
                                <li>calm predictions</li>
                                <li>powerByBand across channels</li>
                            </ul>
                        </>
                    }
                
                    <Experiment
                        name="Generic Experiment"
                        description="Record brain activity for a defined duration"
                        duration={60} // in seconds  
                        notion={notion} // pass in the notion instance
                        channelNames={channelNames} // pass in the channel names
                    />
                        
                </div>
            </main>
                        
        </>
    );
}