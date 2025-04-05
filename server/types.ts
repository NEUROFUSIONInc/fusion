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

export interface OnboardingResponse extends OnboardingQuestion {
  responseValue: string;
  responseTimestamp: number;
}
