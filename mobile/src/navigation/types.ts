import type { RouteProp as NRouteProp } from "@react-navigation/native";

import { CommunityStackParamList } from "./community-navigator";
import { HealthStackParamList } from "./health-navigator";
import { InsightsStackParamList } from "./insights-navigator";
import { PromptStackParamList } from "./prompt-navigator";
import { QuestStackParamList } from "./quest-navigator";

export type RootStackParamList = PromptStackParamList &
  CommunityStackParamList &
  HealthStackParamList &
  InsightsStackParamList &
  QuestStackParamList;

export type RouteProp<T extends keyof RootStackParamList> = NRouteProp<
  RootStackParamList,
  T
>;
