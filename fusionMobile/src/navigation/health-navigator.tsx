import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { Logo } from "~/components/logo";
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
      <Stack.Screen
        name="HealthScreen"
        component={HealthScreen}
        options={{ headerTitle: () => <Logo /> }}
      />
    </Stack.Navigator>
  );
};
