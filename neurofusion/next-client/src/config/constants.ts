import { DefaultOptions } from "@tanstack/react-query";

export const API_URL = process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL;

export const QUERY_OPTIONS_DEFAULT: DefaultOptions = {
  queries: {
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
};

export const STORAGE_KEYS = {
  authToken: "AUTH TOKEN",
};
