import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { HealthScreen } from "~/pages/health";

export type HealthStackParamList = {
  HealthScreen: undefined;
};

export type HealthScreenNavigationProp =
  NativeStackNavigationProp<HealthStackParamList>;

const Stack = createNativeStackNavigator<HealthStackParamList>();

export const HealthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HealthScreen" component={HealthScreen} />
    </Stack.Navigator>
  );
};
