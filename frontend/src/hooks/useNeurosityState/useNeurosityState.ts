import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useReducer } from "react";

import { neurosityReducer, initialState, DeviceInfo } from "./config";

import { API_URL } from "~/config";
import { neurosity } from "~/services";

export function useNeurosityState() {
  const [state, dispatch] = useReducer(neurosityReducer, initialState);
  const { data: sessionData } = useSession();

  let customToken = "";
  if (typeof window !== "undefined") {
    customToken = localStorage.getItem("neurosityCustomToken") ?? "";
  }

  useEffect(() => {
    const subscription = neurosity.onAuthStateChanged().subscribe(async (user) => {
      if (user) {
        dispatch({ type: "SUCCESS", user });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    neurosity
      .getDevices()
      .then((devices) => {
        dispatch({ type: "SET_DEVICES", devices });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [state.user]);

  // Check for presence of customToken and trigger login
  useEffect(() => {
    if (!customToken) {
      return;
    }

    if (!state.user && customToken) {
      neurosity.login({ customToken }).catch((error) => {
        dispatch({ type: "SET_OAUTH_ERROR", error: error.message });
      });
    }
  }, [customToken, state.user]);

  async function disconnectNeurosityAccount() {
    dispatch({ type: "SET_LOADING", loading: true });
    await neurosity.removeOAuthAccess().then(() => {
      localStorage.removeItem("neurositySelectedDevice");
      localStorage.removeItem("neurosityCustomToken");
      dispatch({ type: "LOGOUT" });
    });
  }

  async function connectNeurosityAccount() {
    try {
      console.log("Connecting Neurosity account...");
      dispatch({ type: "SET_LOADING", loading: true });
      const res = await axios.get(`${API_URL}/api/neurosity/get-oauth-url`, {
        headers: {
          Authorization: `Bearer ${sessionData?.user?.authToken}`,
        },
        params: {
          redirectUri: window.location.origin + "/neurosity-callback",
        },
      });
      console.log("Got response from API");

      if (res.status === 200) {
        // redirects the browser to the Neurosity OAuth sign-in page
        if (typeof window !== "undefined") {
          window.location.href = res.data.url;
        }
      } else {
        console.error(`Error: Did not receive url`);
      }
    } catch (error: any) {
      dispatch({ type: "SET_OAUTH_ERROR", error: error.message });
      console.error(error.message);
    }
  }

  return {
    ...state,
    updateNeurositySelectedDevice,
    getNeurositySelectedDevice,
    connectNeurosityAccount,
    disconnectNeurosityAccount,
  };
}

export function useOAuthResult() {
  return getOAuthParams();
}

function getOAuthParams() {
  // eslint-disable-next-line no-negated-condition
  if (typeof window !== "undefined") {
    // Parse the query string from the asPath
    const queryString = window.location.hash.substring(1);

    // Extract the value of the access_token parameter
    const params = new URLSearchParams(queryString);
    const accessToken = params.get("access_token");
    const state = params.get("state");
    const error = params.get("error");

    window.localStorage.setItem("neurosityCustomToken", accessToken || "");
    window.localStorage.setItem("error", error || "");

    return {
      customToken: accessToken,
      state,
      error,
    };
  } else {
    return {
      customToken: null,
      state: null,
      error: null,
    };
  }
}

export function getNeurositySelectedDevice() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("neurositySelectedDevice");
  }
}

export function updateNeurositySelectedDevice(event: React.ChangeEvent<HTMLSelectElement>) {
  const deviceId = event.target.value;
  if (deviceId.length > 0) {
    connectToNeurosityDevice(deviceId);
  }
}

export async function connectToNeurosityDevice(deviceId: string) {
  const device = await neurosity.selectDevice((devices) => {
    return devices.find((device) => device.deviceId === deviceId) as DeviceInfo;
  });
  if (!device) {
    return;
  }
  localStorage.setItem("neurositySelectedDevice", deviceId);
  return device;
}

export async function enableBackgroundRecording() {
  // when this fuction is called, we make a request to the backend to
  // - store neurosity tokens to enable a recurding
  // - backend will search for active devices and use token to connect.
}
