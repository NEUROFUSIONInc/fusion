// will contain settings page for
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from "react";
import { React, useState } from "react";
import SideNavBar from "../components/sidenavbar";
import { notion, useNotion } from "../services/neurosity";
import {
  getNeurositySelectedDevice,
  updateNeurositySelectedDevice,
} from "../services/appsettings";
import axios from "axios";
import { useNeurofusionUser } from "../services/auth";

function ConnectNeurosityAccountButton() {
  //  check if neurosity is signed in and then
  const { user, devices } = useNotion();
  // const {}
  const [neurositySelectedDevice, setNeurositySelectedDevice] = useState(
    getNeurositySelectedDevice()
  );

  async function connectNeurosityAccount() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/neurosity/get-oauth-url`
      );

      if (res.status == 200) {
        // redirects the browser to the Neurosity OAuth sign-in page
        window.location.href = res.data.url;
      } else {
        console.error(`Error: Did not receive url`);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  async function disconnectNeurosityAccount() {
    await notion
      .removeOAuthAccess()
      .then(() => {
        localStorage.removeItem("neurositySelectedDevice");
      })
      .catch((error) => {
        // setError(error?.message);
      });
  }

  return (
    <>
      <h3>EEG Data (Neurosity)</h3>
      {!user ? (
        <button onClick={connectNeurosityAccount}>
          Connect Neurosity Account
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <label>Active Device:</label>
          <select onChange={updateNeurositySelectedDevice}>
            <option value="">Choose a device</option>
            {devices.map((device) => {
              if (device.deviceId === neurositySelectedDevice) {
                return (
                  <option value={device.deviceId} selected>
                    {device.deviceNickname}
                  </option>
                );
              } else {
                return (
                  <option value={device.deviceId}>
                    {device.deviceNickname}
                  </option>
                );
              }
            })}
          </select>

          {/* TODO: needs more dev */}
          {/* <label for="neurosity_alwayson">Enable Always On Recording?</label>
                    <input type="checkbox" id="neurosity_alwayson" name="neurosity_alwayson" value="True" /> */}

          <button onClick={disconnectNeurosityAccount}>
            Disconnect Neurosity Account from Neurofusion
          </button>
        </div>
      )}
    </>
  );
}

function ConnectMagicFlow() {
  const [magicflowToken, setMagicflowToken] = useState("");
  const neurofusionUserInfo = useNeurofusionUser();

  useEffect(() => {
    (async () => {
      const magicflowToken = await getMagicflowToken();
      setMagicflowToken(magicflowToken);
    })();
  }, []);

  async function getMagicflowToken() {
    const res = await axios.get(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/magicflow/get-token`
    );

    if (res.status == 200) {
      return res.data.magicflowToken;
    } else {
      console.log("error getting magicflow token");
    }
  }

  const handleTokenChange = (event) => {
    if (event.target.value !== magicflowToken) {
      setMagicflowToken(event.target.value);
    }
  };

  const handleMagicFlowTokenSave = async (event) => {
    event.preventDefault();
    alert(`making backend request with value ${magicflowToken}`);
    const res = await axios.post(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/magicflow/set-token`,
      {
        magicflowToken: magicflowToken,
      }
    );

    if (res.status == 200) {
      return res.data.magicflowToken;
    } else {
      console.log("error setting magicflow token");
    }
  };

  return (
    <>
      <h3>Productivity Data (Magicflow)</h3>
      <label for="magicflowToken">Magicflow Token:</label>
      <textarea
        id="magicflowToken"
        type="text"
        name="magicflowToken"
        value={magicflowToken}
        onChange={handleTokenChange}
      ></textarea>
      <button onClick={handleMagicFlowTokenSave}>Update Magicflow token</button>
    </>
  );
}

function ConnectVital() {
  return (
    <>
      <h3>Health Data (Oura/Apple Health)</h3>
      <p>Coming soon!</p>
    </>
  );
}

export default function Settings() {
  const neurofusionUserInfo = useNeurofusionUser();

  return (
    <>
      {neurofusionUserInfo.isLoggedIn == true ? (
        <>
          <SideNavBar></SideNavBar>

          <main
            style={{
              marginLeft: "12%",
              paddingLeft: "10px",
            }}
          >
            <h1>Settings</h1>

            <h2>Data Onboarding</h2>

            <ConnectNeurosityAccountButton />

            <ConnectMagicFlow />

            <ConnectVital />
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
