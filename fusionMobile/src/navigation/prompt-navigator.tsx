import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Prompt } from "~/@types";
import { EditPromptHeader, PromptsHeader } from "~/components";
import {
  PromptsScreen,
  PromptScreen,
  PromptEntryScreen,
  ResponsesScreen,
} from "~/pages";

export type PromptStackParamList = {
  Prompts: undefined;
  EditPrompt: {
    promptId: string;
  };
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
        name="EditPrompt"
        component={PromptScreen}
        options={{ header: () => <EditPromptHeader /> }}
      />
      <Stack.Screen
        name="ViewResponses"
        component={ResponsesScreen}
        options={{ title: "Prompt Responses" }}
      />
      <Stack.Screen
        name="PromptEntry"
        component={PromptEntryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
