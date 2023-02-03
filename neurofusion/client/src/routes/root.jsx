import React, { useState, useEffect } from 'react';

import Experiment from '../components/experiment';
import SelfSample from '../components/selfsample';
import SideNavBar from '../components/sidenavbar';
import SignalQuality from '../components/signalquality';

import { notion, useNotion } from "../services/neurosity";
import { getNeurositySelectedDevice, updateNeurositySelectedDevice } from '../services/appsettings';
import { useNeurofusionUser } from '../services/auth';

import '../App.css';

export default function Root() {

    const neurosityUserInfo = useNotion();
    const neurofusionUserInfo = useNeurofusionUser();

    const [neurositySelectedDevice, setNeurositySelectedDevice] = useState(getNeurositySelectedDevice());

    const [deviceStatus, setDeviceStatus] = useState("offline");

    // e.g CP3, C3, F5, PO3, PO4, F6, C4, CP4
    const [channelNames, setChannelNames] = useState([]);

    useEffect(() => {
        // redirect to login page if not signed in
        console.log("validating user login")

        if (neurofusionUserInfo.isLoading == false && neurofusionUserInfo.isLoggedIn !== true) {
            window.location.href = '/login';
        }
    }, [neurofusionUserInfo])

    // sign in to neurosity device
    useEffect(() => {
        if (!neurositySelectedDevice) {
            alert("Looks like you haven't connected a Neurosity device yet. Redirecting you to the setting page to continue")
            window.location.href = '/settings';
        } else {
            console.log("neurosity user info", neurosityUserInfo);
            console.log("neurofusion user is", neurofusionUserInfo);

            (async () => {
                await notion.selectDevice(["deviceId", neurositySelectedDevice]).then(() => {
                    console.log(`connected to neurosity device ${neurositySelectedDevice}`)
                });
            })();

            (async () => {
                // validate that the device is online
                await notion.status().subscribe(status => {
                    if (status.state !== deviceStatus) {
                        let deviceState = status.state;
                        (status.sleepMode) ? deviceState = "sleep" : deviceState = status.state;
                        setDeviceStatus(deviceState);

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
    }, [neurofusionUserInfo]);

    return (
        <>
        {
            neurofusionUserInfo.isLoggedIn == true ?
                <>
                    <SideNavBar></SideNavBar>

                    <main style={{ marginLeft: '12%', paddingLeft: "10px" }}>
                        <div id="devices">
                            {/* repeated in settings page, should be a component */}
                            {/* TODO: Bug changing device here will not retrigger subscription */}
                            <label>Active Device:</label>
                            <select onChange={updateNeurositySelectedDevice}>
                                {neurosityUserInfo.devices.map((device) => {
                                    <option value="">Choose a device</option>
                                    if (device.deviceId === neurositySelectedDevice) {
                                        return <option value={device.deviceId} selected>{device.deviceNickname}</option>
                                    } else {
                                        return <option value={device.deviceId}>{device.deviceNickname}</option>
                                    }
                                })}
                            </select>
                        </div>

                        <p>Your device is: <strong>{deviceStatus}</strong></p>

                        {deviceStatus === "online" ?
                            <SignalQuality channelNames={channelNames} deviceStatus={deviceStatus} />
                            : <></>
                        }

                        <div id="record-experiment">
                            <h2>Experiments</h2>

                            {deviceStatus !== "online" ? (
                                <div>
                                    <p>You need to be logged in with device turned on to record an experiment</p>
                                </div>
                            ) :
                                <>
                                    <p>After every experiment, 5 files will automatically be uploaded to storage.</p>
                                    <p>Go to <a href="/recordings">recordings tab</a> to see your history</p>
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
                                description="Record brain activity for a defined duration (secs)"
                                duration={60} // in seconds  
                                notion={notion} // pass in the notion instance
                                channelNames={channelNames} // pass in the channel names
                            />

                        </div>

                        {/* <SelfSample /> */}
                    </main>
                </>
                : <></>
        }
        </>
    );
}