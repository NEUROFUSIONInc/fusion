import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { InsightsHeader } from "~/components";
import { InsightsScreen } from "~/pages/insights";

export type InsightsStackParamList = {
  InsightsPage: {
    chartPeriod?: "week" | "month";
    promptUuid?: string;
  };
};

export type InsightsScreenNavigationProp =
  NativeStackNavigationProp<InsightsStackParamList>;

const Stack = createNativeStackNavigator<InsightsStackParamList>();

export const InsightsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <InsightsHeader />,
      }}
    >
      <Stack.Screen name="InsightsPage" component={InsightsScreen} />
    </Stack.Navigator>
  );
};
