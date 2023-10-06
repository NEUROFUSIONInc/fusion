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
  enableResearchMode: boolean;
}
