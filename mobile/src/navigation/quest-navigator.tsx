import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { Quest } from "~/@types";
import { QuestsHeader, QuestDetailHeader } from "~/components";
import { QuestDetailScreen } from "~/pages";
import { QuestsScreen } from "~/pages/quests";

export type QuestStackParamList = {
  QuestsScreen: undefined;
  QuestDetailScreen: {
    quest: Quest;
  };
};

export type QuestScreenNavigationProp =
  NativeStackNavigationProp<QuestStackParamList>;

const Stack = createNativeStackNavigator<QuestStackParamList>();

export const QuestStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="QuestsScreen"
        component={QuestsScreen}
        options={{ header: () => <QuestsHeader /> }}
      />
      <Stack.Screen
        name="QuestDetailScreen"
        component={QuestDetailScreen}
        options={{ header: () => <QuestDetailHeader /> }}
      />
    </Stack.Navigator>
  );
};
