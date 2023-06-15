import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Prompt } from "~/@types";
import { PromptsHeader } from "~/components";
import {
  PromptsScreen,
  PromptScreen,
  PromptEntryScreen,
  ResponsesScreen,
} from "~/pages";

export type PromptStackParamList = {
  Prompts: undefined;
  AuthorPrompt:
    | {
        prompt?: Prompt;
        promptText?: string;
        responseType?: string;
        notificationConfig_countPerDay?: number;
        notificationConfig_startTime?: string;
        notificationConfig_endTime?: string;
      }
    | undefined;
  ViewResponses: {
    prompt: Prompt;
  };
  PromptEntry: {
    promptUuid: string;
    triggerTimestamp: number | null;
  };
};

export type PromptScreenNavigationProp =
  NativeStackNavigationProp<PromptStackParamList>;

const Stack = createNativeStackNavigator<PromptStackParamList>();

export const PromptStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <PromptsHeader />,
      }}
    >
      <Stack.Screen name="Prompts" component={PromptsScreen} />
      <Stack.Screen
        name="AuthorPrompt"
        component={PromptScreen}
        options={{ title: "Author Prompt" }}
      />
      <Stack.Screen
        name="ViewResponses"
        component={ResponsesScreen}
        options={{ title: "Prompt Responses" }}
      />
      <Stack.Screen
        name="PromptEntry"
        component={PromptEntryScreen}
        options={{ title: "Prompt Entry" }}
      />
    </Stack.Navigator>
  );
};
