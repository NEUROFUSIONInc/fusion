import React, { useContext, createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { Notion } from "@neurosity/notion";
import useLocalStorage from "react-use/lib/useLocalStorage";

const deviceId = "8521599236afdebc792ca3015005d153";
export const notion = new Notion({
    // deviceId: deviceId
  autoSelectDevice: false
});

const initialState = {
  selectedDevice: null,
  status: null,
  user: null,
  loadingUser: true
};

export const NotionContext = createContext();

export const useNotion = () => {
  return useContext(NotionContext);
};

export function ProvideNotion({ children }) {
  const notionProvider = useProvideNotion();

  return (
    <NotionContext.Provider value={notionProvider}>
      {children}
    </NotionContext.Provider>
  );
}

function useProvideNotion() {
  const [
    lastSelectedDeviceId,
    setLastSelectedDeviceId
  ] = useLocalStorage("deviceId");

  const [state, setState] = useState({
    ...initialState
  });

  const { user, selectedDevice } = state;

  const setSelectedDevice = useCallback((selectedDevice) => {
    setState((state) => ({
      ...state,
      selectedDevice
    }));
  }, []);

  useEffect(() => {
    if (user && !selectedDevice) {
      notion.selectDevice((devices) =>
        lastSelectedDeviceId
          ? devices.find(
              (device) => device.deviceId === lastSelectedDeviceId
            )
          : devices[0]
      );
    }
  }, [user, lastSelectedDeviceId, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }

    const subscription = notion.status().subscribe((status) => {
      setState((state) => ({ ...state, status }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDevice]);

  useEffect(() => {
    setState((state) => ({ ...state, loadingUser: true }));

    const subscription = notion
      .onAuthStateChanged()
      .subscribe((user) => {
        setState((state) => ({
          ...state,
          user,
          loadingUser: false
        }));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sub = notion.onDeviceChange().subscribe((selectedDevice) => {
      setSelectedDevice(selectedDevice);
      setLastSelectedDeviceId(selectedDevice.deviceId); // cache locally
    });

    return () => {
      sub.unsubscribe();
    };
  }, [setSelectedDevice, setLastSelectedDeviceId]);

  const logoutNotion = useCallback(() => {
    return new Promise((resolve) => {
      notion.logout().then(resolve);
      setState({ ...initialState, loadingUser: false });
    });
  }, []);

  return {
    ...state,
    lastSelectedDeviceId,
    setLastSelectedDeviceId,
    logoutNotion,
    setSelectedDevice
  };
}