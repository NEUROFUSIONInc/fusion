// will contain settings page for 
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from 'react';
import { React, useState } from 'react';
import SideNavBar from '../components/sidenavbar';
import { notion, useNotion } from '../services/neurosity';
import { getNeurositySelectedDevice, updateNeurositySelectedDevice } from '../services/appsettings';
import axios from 'axios';
import { useNeurofusionUser } from '../services/auth';


function ConnectNeurosityAccountButton() {

    //  check if neurosity is signed in and then
    const { user, devices } = useNotion();
    // const {}
    const [neurositySelectedDevice, setNeurositySelectedDevice] = useState(getNeurositySelectedDevice());

    function connectNeurosityAccount() {
      fetch(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/neurosity/get-oauth-url`)
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

        await notion.removeOAuthAccess().then(() => {
            localStorage.removeItem('neurositySelectedDevice');
        }).catch((error) => {
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
                        <option value="">Choose a device</option>
                        {devices.map((device) => {
                            if (device.deviceId === neurositySelectedDevice) {
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

function ConnectMagicFlow() {
    const [magicflowToken, setMagicflowToken] = useState([]);

    useEffect(() => {
        setMagicflowToken(getMagicflowToken());
    },[]);

    function getMagicflowToken() {
        axios.get(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/magicflow/get-token`,
        {
            params: {
                "userEmail": "oreogundipe@gmail.com" //TODO: fetch from signed in user information
            }
        }).then((res) => {
            console.log(res);
            return res.data.token;
        }).catch((err) => {
            console.log(err);
        });
    }

    const handleTokenChange = (event) => {
        if( event.target.value !== magicflowToken){
            setMagicflowToken(event.target.value);
        }
    }

    const handleMagicFlowTokenSave = (event) => {
        event.preventDefault();
        alert(`making backend request with value ${magicflowToken}`);
        axios.post(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/magicflow/set-token`,
        {
            "user_email": "oreogundipe@gmail.com",
            "token": magicflowToken
        }).then((res) => {
            console.log(res);
            return res.data.token;
        }).catch((err) => {
            console.log(err);
        });
    }

    return (
        <>
            <h3>Productivity Data (Magicflow)</h3>
            <label for="magicflowToken">
                Magicflow Token:
            </label>
            <textarea id="magicflowToken" type="text" name="magicflowToken" value={magicflowToken} onChange={handleTokenChange}></textarea>
            <button onClick={handleMagicFlowTokenSave}>Update Magicflow token</button>
        </>
    )
}

export default function Settings() {
    const neurofusionUserInfo = useNeurofusionUser();
    
    return (
        <>
        {
            neurofusionUserInfo.isLoggedIn == true ?
            <>
                <SideNavBar></SideNavBar>

                <main style={{
                    marginLeft: '12%',
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
        : <></>
        }
        </>
    );
}