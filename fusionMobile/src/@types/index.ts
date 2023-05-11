export type PromptResponseType = "text" | "yesno" | "number";

export interface Prompt {
  uuid: string;
  promptText: string;
  responseType: PromptResponseType;
  notificationConfig_days: string;
  notificationConfig_startTime: string;
  notificationConfig_endTime: string;
  notificationConfig_countPerDay: number;
}

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
