import axios from "axios";

import { API_URL } from "./constants";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    Accept: "application/json",
    "Content-type": "application/json",
  },
});
