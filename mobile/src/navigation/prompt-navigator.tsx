import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Prompt, PromptResponse } from "~/@types";
import {
  EditPromptHeader,
  PromptsHeader,
  QuickAddPromptsHeader,
} from "~/components";
import {
  PromptsScreen,
  EditPromptScreen,
  PromptEntryScreen,
  QuickAddPromptsScreen,
} from "~/pages";

export type PromptStackParamList = {
  Prompts: undefined;
  EditPrompt:
    | {
        type: "edit";
        promptId: string;
      }
    | {
        type: "add";
        prompt: Prompt;
      };
  QuickAddPrompts: {
    selectedCategory?: string;
  };
  PromptEntry: {
    promptUuid: string;
    triggerTimestamp: number | null;
    prompts?: Prompt[];
    index?: number;
    previousPromptResponse?: PromptResponse; // used for editing
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
        component={EditPromptScreen}
        options={{ header: () => <EditPromptHeader /> }}
      />
      <Stack.Screen
        name="PromptEntry"
        component={PromptEntryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuickAddPrompts"
        component={QuickAddPromptsScreen}
        options={{ header: () => <QuickAddPromptsHeader /> }}
      />
    </Stack.Navigator>
  );
};
