import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Logo } from "~/components/logo";
import { QuestsScreen } from "~/pages/quests";

export type QuestStackParamList = {
  QuestsScreen: undefined;
};

export type HealthScreenNavigationProp =
  NativeStackNavigationProp<QuestStackParamList>;

const Stack = createNativeStackNavigator<QuestStackParamList>();

export const QuestStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="QuestsScreen"
        component={QuestsScreen}
        options={{ headerTitle: () => <Logo /> }}
      />
    </Stack.Navigator>
  );
};
