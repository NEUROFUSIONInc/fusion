import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Prompt } from "~/@types";
import { InsightsHeader } from "~/components";
import { InsightContextProvider } from "~/contexts";
import { PromptResponsesScreen } from "~/pages";
import { InsightsScreen } from "~/pages/insights";

export type InsightsStackParamList = {
  InsightsPage: {
    chartPeriod?: "day" | "week" | "month" | "year";
    promptUuid?: string;
  };
  PromptResponsesPage: {
    prompt: Prompt;
    selectedDate: string;
  };
};

export type InsightsScreenNavigationProp =
  NativeStackNavigationProp<InsightsStackParamList>;

const Stack = createNativeStackNavigator<InsightsStackParamList>();

export const InsightsStack = () => {
  return (
    <InsightContextProvider>
      <Stack.Navigator
        screenOptions={{
          header: () => <InsightsHeader />,
        }}
      >
        <Stack.Screen name="InsightsPage" component={InsightsScreen} />
        <Stack.Screen
          name="PromptResponsesPage"
          component={PromptResponsesScreen}
        />
      </Stack.Navigator>
    </InsightContextProvider>
  );
};
