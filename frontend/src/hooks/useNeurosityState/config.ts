export interface DeviceInfo {
  deviceId: string;
  deviceNickname: string;
  channelNames: string[];
  channels: number;
  samplingRate: number;
  manufacturer: string;
  model: string;
  modelName: string;
  modelVersion: string;
  osVersion: string;
  apiVersion: string;
  emulator?: boolean;
}

export interface NeurosityState {
  loading: boolean;
  user: any | null;
  oAuthError: string | null;
  devices: DeviceInfo[];
}

type NeurosityAction =
  | { type: "SUCCESS"; user: any }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_OAUTH_ERROR"; error: string | null }
  | { type: "SET_DEVICES"; devices: DeviceInfo[] }
  | { type: "LOGOUT" };

export const acmeNeuroConfig = {
  enableDBQuery: false,
  testNeurosityUserId: "OEWjFDdq6mMFKyDtSafg1edxnr25",
};

export const initialState: NeurosityState = {
  loading: true,
  user: null,
  oAuthError: null,
  devices: [],
};

export function neurosityReducer(state: NeurosityState, action: NeurosityAction) {
  switch (action.type) {
    case "SUCCESS":
      return { ...state, user: action.user, loading: false, oAuthError: null };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_OAUTH_ERROR":
      return { ...state, oAuthError: action.error, loading: false };
    case "SET_DEVICES":
      return { ...state, devices: action.devices };
    case "LOGOUT":
      return { ...initialState, loading: false };
    default:
      return state;
  }
}
