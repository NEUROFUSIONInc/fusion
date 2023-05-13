import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import * as React from "react";
import { Prompt } from "~/@types";
import { Logo } from "~/components/logo";
import { HomeScreen } from "~/pages/home";
import { PromptScreen } from "~/pages/prompt";
import { PromptEntryScreen } from "~/pages/promptEntry";
import { ResponsesScreen } from "~/pages/responses";

export type PromptStackParamList = {
  Home: undefined;
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
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: () => <Logo /> }}
      />
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
