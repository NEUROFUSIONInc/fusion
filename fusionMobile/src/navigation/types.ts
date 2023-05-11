import type { RouteProp as NRouteProp } from "@react-navigation/native";

import { PromptStackParamList } from "./prompt-navigator";
import { AccountStackParamList } from "./account-navigator";
import { HealthStackParamList } from "./health-navigator";

export type RootStackParamList = PromptStackParamList &
  AccountStackParamList &
  HealthStackParamList;

export type RouteProp<T extends keyof RootStackParamList> = NRouteProp<
  RootStackParamList,
  T
>;
