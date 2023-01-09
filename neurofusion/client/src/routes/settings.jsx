// will contain settings page for 
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from 'react';
import { React, useState } from 'react';
import SideNavBar from '../components/sidenavbar';
import { notion, useNotion } from '../services/neurosity';

export function ConnectNeurosityAccountButton() {

    //  check if neurosity is signed in and then
    const { user, devices } = useNotion();
    const [neurositySelectedDevice, setNeurositySelectedDevice] = useState(getNeurositySelectedDevice());


    function getNeurositySelectedDevice() {
        return localStorage.getItem("neurositySelectedDevice")
    }

    function updateNeurositySelectedDevice(event) {
        const deviceId = event.target.value;
        alert(`selected device id - ${deviceId}`);
        localStorage.setItem("neurositySelectedDevice", deviceId)
    }
    
    function connectNeurosityAccount() {
      fetch(`http://localhost:4000/api/get-neurosity-oauth-url`)
        .then((res) => res.json())
        .then(data => {
          console.log(data)
          if (data.statusCode === 200) {
            // redirects the browser to the Neurosity OAuth sign-in page
            window.location.href = data.body.url;
          } else {
            console.error(`Error: Did not receive url`);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }

    async function disconnectNeurosityAccount() {
        // setError("");
        // setRemovingAccess(true);

        await notion.removeOAuthAccess().catch((error) => {
            // setError(error?.message);
        });

        // setRemovingAccess(false);
    }
  
    return (
        <>
            <h3>EEG Data (Neurosity)</h3>
            { !user ?
                <button onClick={connectNeurosityAccount}>
                    Connect Neurosity Account
                </button>
            :
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }}>
                    <label>Active Device:</label>
                    <select onChange={updateNeurositySelectedDevice}>
                        {devices.map((device) => {
                            if (device.deviceId == neurositySelectedDevice) {
                                return <option value={device.deviceId} selected>{device.deviceNickname}</option>
                            }else {
                                return <option value={device.deviceId}>{device.deviceNickname}</option>
                            }
                        })}
                    </select>

                    {/* TODO: needs more dev */}
                    {/* <label for="neurosity_alwayson">Enable Always On Recording?</label>
                    <input type="checkbox" id="neurosity_alwayson" name="neurosity_alwayson" value="True" /> */}

                    <button onClick={disconnectNeurosityAccount}>Disconnect Neurosity Account from Neurofusion</button>
                </div>
            }
            
        </>
    );
}

export function ConnectMagicFlow() {
    const handleTokenChange = (event) => {

    }

    const handleMagicFlowTokenSave = (event) => {
        // call magicflow api to validate token

        // save token to localstorage
    }
    return (
        <form onSubmit={handleMagicFlowTokenSave}>
            <h3>Productivity Data (magicflow)</h3>
            <label>
                Magicflow Token:
                <input type="text" name="token" onChange={handleTokenChange} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    )
}

export default function Settings() {

    const [magicflowToken, setMagicflowToken] = useState({})

    useEffect(() => {
        // get magicflow token from localstorage
        // setMagicflowToken(token)        
    }, [])

    return (
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
                paddingLeft: "10px"
            }}>
                <h1>Settings</h1>

                <h2>Data Onboarding</h2>

                <ConnectNeurosityAccountButton />

                <ConnectMagicFlow />

                <h3>Health Data (Oura/Apple Health)</h3>
                <p>Coming soon!</p>
            </main>
        </>
    );
}