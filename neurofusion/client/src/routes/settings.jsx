// will contain settings page for
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from "react";
import { React, useState, useCallback } from "react";
import SideNavBar from "../components/sidenavbar";
import { notion, useNotion } from "../services/neurosity";
import { useVitalLink } from "@tryvital/vital-link";
import {
  getNeurositySelectedDevice,
  updateNeurositySelectedDevice,
} from "../services/appsettings";
import axios from "axios";
import { useNeurofusionUser } from "../services/auth";

function ConnectNeurosity() {
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
            Disconnect Neurosity Account
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
  const [isLoading, setLoading] = useState(false);
  const [vitalDevices, setVitalDevices] = useState([]);

  useEffect(() => {
    updateVitalDeviceList();
  }, []);

  async function generateLinkToken() {
    const res = await axios.get(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/vital/get-token`
    );

    if (res.status == 200) {
      console.log(res.data.linkToken);
      return res.data.linkToken;
    } else {
      alert("error getting vital link token");
      console.log("error getting vital link token");
    }
  }

  async function updateVitalDeviceList() {
    const res = await axios.get(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/vital/get-devices`
    );

    if (res.status == 200) {
      setVitalDevices(res.data.devices);
      return res.data.devices;
    } else {
      alert("error getting vital devices");
      console.log("error getting vital devices");
    }
  }

  const onSuccess = useCallback((metadata) => {
    // Device is now connected.
    console.log(metadata);
    // make api call to get connected devices
    updateVitalDeviceList();
  }, []);

  const onExit = useCallback((metadata) => {
    // User has quit the link flow.
    console.log(metadata);
    updateVitalDeviceList();
  }, []);

  const onError = useCallback((metadata) => {
    // Error encountered in connecting device.
    console.log(metadata);
    updateVitalDeviceList();
  }, []);

  const config = {
    onSuccess,
    onExit,
    onError,
    env: process.env.REACT_APP_VITALLINK_ENV,
  };

  const { open, ready, error } = useVitalLink(config);

  const handleVitalOpen = async () => {
    setLoading(true);
    try {
      const token = await generateLinkToken();
      open(token);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3>Health Data (Oura/Apple Health)</h3>
      <button
        type="button"
        onClick={handleVitalOpen}
        disabled={isLoading || !ready}
      >
        Connect health device
      </button>

      {error && <p>{error}</p>}

      {vitalDevices && vitalDevices.length > 0 ? (
        <ul>
          {vitalDevices.map((device) => {
            return (
              <li>
                {device.name}, {device.status}
              </li>
            );
          })}
        </ul>
      ) : (
        <></>
      )}
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

            <ConnectNeurosity />

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
