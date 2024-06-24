export interface MetaSeo {
  title: string;
  description: string;
  image: string;
  keywords: string[];
  author: {
    name: string;
  };
  social: Record<string, string>;
}

export interface IExperiment {
  id: number;
  name: string;
  description: string;
  image?: string;
  url?: string;
  tags?: string[];
  duration?: number;
}

export interface EventData {
  startTimestamp: number;
  duration: number;
  data: string;
}

export interface PowerByBand {
  data: {
    gamma: number[];
    beta: number[];
    alpha: number[];
    theta: number[];
    delta: number[];
  };
}

interface DeviceInfo {
  name: string;
  samplingRate: number;
  channels: string[];
  manufacturer?: string;
}

export interface DatasetExport {
  fileNames: string[];
  dataSets: Array<any>;
}

export interface IQuest {
  title: string;
  description: string;
  config: string;
  guid: string;
  userGuid: string;
  createdAt: string;
  updatedAt: string;
  joinCode: string;
  organizerName?: string;
  participants?: string[]; // userNpubs
}

export interface dataSource {
  sourceName: string;
  sourceId: string;
}

export interface FusionHealthDataset {
  date: string;
  sleepSummary: FusionSleepSummary;
  stepSummary: FusionStepSummary;
  heartRateSummary?: FusionHeartRateSummary;
}

export interface FusionQuestDataset {
  userGuid: string;
  questGuid: string;
  timestamp: number;
  value: FusionHealthDataset[];
  type: string;
}

interface FusionStepSummary {
  date: string;
  totalSteps: number;
}
interface FusionSleepSummary {
  date: string;
  duration: number;
  // sleepStartTime: string;
  // sleepEndTime: string;
  source?: dataSource;
  summaryType?: "overall" | "device";
  sourceId?: string;
  sourceName?: string;
  value?: "awake" | "asleep" | "core" | "rem" | "deep" | "inbed";
}

interface FusionHeartRateSummary {
  date: string;
  average: number;
  min?: number;
  max?: number;
  source?: dataSource;
  summaryType?: "overall" | "device";
  sourceId?: string;
  sourceName?: string;
}

export interface DisplayCategory {
  name: string;
  value: string;
}
