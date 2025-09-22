export type PromptResponseType =
  | "text"
  | "yesno"
  | "number"
  | "numberRange"
  | "customOptions";

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

export enum PromptNotifyOperator {
  equals = "equals",
  not_equals = "not_equals",
  greater_than = "greater_than",
  less_than = "less_than",
  contains = "contains",
  not_contains = "not_contains",
}
export interface PromptNotifyCondition {
  sourceType: "prompt" | "onboardingQuestion";
  sourceId: string;
  operator: PromptNotifyOperator;
  value: string;
}

export type PromptAdditionalMeta = {
  category?: string;
  isNotificationActive?: boolean;
  customOptionText?: string; // ; separated list of options
  singleResponse?: boolean; // if true, only one response is allowed during custom option selection
  questId?: string;
  notifyConditions?: PromptNotifyCondition[];
  numberRangeOptions?: {
    min: number;
    max: number;
  };
};

export type CreatePrompt = Omit<Prompt, "notificationConfig_days" | "uuid"> & {
  uuid?: string | null;
  notificationConfig_days: NotificationConfigDays;
};

export type Days =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type NotificationConfigDays = Record<Days, boolean>;

export interface PromptNotificationResponse {
  id?: string;
  promptUuid: string;
  value: string;
  triggerTimestamp: number;
  endTimestamp: number;
}

export interface PromptResponse {
  id?: string;
  promptUuid: string;
  value: string;
  triggerTimestamp: number;
  responseTimestamp: number;
  additionalMeta?: PromptResponseAdditionalMeta;
}

export interface PromptResponseAdditionalMeta {
  note?: string;
}

export interface PromptResponseWithEvent {
  startTimestamp: number;
  endTimestamp: number;
  event: {
    name: string;
    description: string;
    value: string;
  };
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface UserAccount {
  npub: string;
  pubkey: string;
  privkey: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  enableCopilot: boolean;
  enableHealthConnect: boolean;
  lastActiveCategory: string;
  activeQuest: Quest | null;
}

export interface StreakEntry {
  timestamp: number;
  score: number;
}

export interface Quest {
  title: string;
  description: string;
  guid: string;
  organizerName: string;
  startTimestamp?: number;
  endTimestamp?: number;
  prompts?: Prompt[];
  additionalMeta?: object;
  config?: string;
}

export interface QuestDataset {
  questGuid: string;
  type: "prompt_response" | "health";
  value: string;
  timestamp: number;
}

export interface QuestPrompt {
  questId: string;
  promptId: string;
}

export interface OnboardingQuestion {
  guid: string;
  question: string;
  options?: string[];
  required: boolean;
  type: PromptResponseType;
}

export interface OnboardingResponse extends OnboardingQuestion {
  responseValue: string;
  responseTimestamp: number;
}

export const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export enum PromptOptionKey {
  record = "record",
  previous = "previous",
  edit = "edit",
  notification = "notification",
  delete = "delete",
  share = "share",
}

export const allPromptOptionKeys = [
  PromptOptionKey.record,
  PromptOptionKey.previous,
  PromptOptionKey.notification,
  PromptOptionKey.edit,
  PromptOptionKey.delete,
];

export interface FusionHealthDataset {
  date: string;
  sleepSummary: FusionSleepSummary;
  stepSummary: FusionStepSummary;
  heartRateSummary?: FusionHeartRateSummary;
}

export interface HealthDataSummary {
  dateRange: {
    start: string;
    end: string;
  };
  sleep: {
    available: boolean;
    averageDuration?: number;
    daysTracked?: number;
  };
  steps: {
    available: boolean;
    averageSteps?: number;
    daysTracked?: number;
  };
  heartRate: {
    available: boolean;
    averageHeartRate?: number;
    daysTracked?: number;
  };
  trends: {
    sufficient: boolean;
    sleep?: {
      available: boolean;
      firstPeriodAverage?: number;
      secondPeriodAverage?: number;
      percentChange?: number;
      direction?: string;
    };
    steps?: {
      available: boolean;
      firstPeriodAverage?: number;
      secondPeriodAverage?: number;
      percentChange?: number;
      direction?: string;
    };
    heartRate?: {
      available: boolean;
      firstPeriodAverage?: number;
      secondPeriodAverage?: number;
      percentChange?: number;
      direction?: string;
    };
    period?: {
      firstHalf: {
        start: string;
        end: string;
      };
      secondHalf: {
        start: string;
        end: string;
      };
    };
  };
}

export interface ProcessedHealthData {
  raw: FusionHealthDataset[];
  summary: HealthDataSummary;
}

export interface AppleHealthSleepSample {
  id: string;
  endDate: string;
  sourceId: string;
  sourceName: string;
  startDate: string;
  value: string;
}

export interface FusionStepSummary {
  date: string;
  totalSteps: number;
}

export interface FusionSleepSummary {
  date: string;
  sources: {
    [sourceId: string]: {
      sourceName: string;
      stages: {
        [key: string]: number;
      };
    };
  };
}

export interface FusionHeartRateSummary {
  date: string;
  average: number;
  morning: number;
  afternoon: number;
  night: number;
  min?: number;
  max?: number;
  source?: HealthDataSource;
  summaryType?: "overall" | "device";
  sourceId?: string;
  sourceName?: string;
}

export interface HealthDataSource {
  sourceName: string;
  sourceId: string;
}

export interface QuestAssignment {
  questId: string;
  timestamp: number;
  assignment: string;
}
