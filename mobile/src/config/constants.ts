import { DefaultOptions } from "@tanstack/react-query";
import { Dimensions, Platform } from "react-native";

export const IS_IOS = Platform.OS === "ios";
const { width, height } = Dimensions.get("screen");

export const WIDTH = width;
export const HEIGHT = height;

export const QUERY_OPTIONS_DEFAULT: DefaultOptions = {
  queries: {
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  },
};
