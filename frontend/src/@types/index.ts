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
  code?: string;
  showLogs?: boolean;
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

export interface FusionUser {
  publicKey: string;
  name?: string;
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
  value: FusionHealthDataset[] | string;
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

export type PromptResponseType = "text" | "yesno" | "number" | "customOptions";

export interface Prompt {
  uuid: string;
  promptText: string;
  responseType: PromptResponseType;
  notificationConfig_days: NotificationConfigDays;
  notificationConfig_startTime: string;
  notificationConfig_endTime: string;
  notificationConfig_countPerDay: number;
  additionalMeta: PromptAdditionalMeta;
}

export type PromptAdditionalMeta = {
  category?: string;
  isNotificationActive?: boolean;
  customOptionText?: string; // ; separated list of options
  singleResponse?: boolean;
  questId?: string;
  notifyConditions?: PromptNotifyCondition[];
};

export type CreatePrompt = Omit<Prompt, "notificationConfig_days" | "uuid"> & {
  uuid?: string | null;
  notificationConfig_days: NotificationConfigDays;
};

export type Days = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export type NotificationConfigDays = Record<Days, boolean>;

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
  participants?: string[];
  prompts: Prompt[];
}

export interface OnboardingQuestion {
  guid: string;
  question: string;
  options?: string[];
  required?: boolean;
  type: PromptResponseType;
}

export interface IQuestConfig {
  onboardingQuestions?: OnboardingQuestion[];
  prompts?: Prompt[];
  collaborators?: string; // comma separated public keys
  experimentConfig?: string; // html code for the experiment
  healthDataConfig?: { [key: string]: boolean };
  assignmentConfig?: QuestAssignment;
}

export const healthDataCategories: DisplayCategory[] = [
  {
    name: "Steps",
    value: "steps",
  },
  {
    name: "Sleep",
    value: "sleep",
  },
  {
    name: "Heart Rate",
    value: "heart_rate",
  },
];

export enum PromptNotifyOperator {
  equals = "equals",
  not_equals = "not_equals",
  greater_than = "greater_than",
  less_than = "less_than",
}
export interface PromptNotifyCondition {
  sourceType: "prompt" | "onboardingQuestion";
  sourceId: string;
  operator: PromptNotifyOperator;
  value: string;
}

export interface QuestAssignment {
  guid: string;
  script: {
    code: string;
    inputs?: QuestAssignmentInput[];
    language: "python" | "javascript";
  };
}

export interface QuestAssignmentInput {
  sourceId: string;
  sourceType: "prompt" | "onboardingQuestion";
  placeholder: string;
}
