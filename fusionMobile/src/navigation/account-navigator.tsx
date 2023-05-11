import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { Logo } from "~/components/logo";
import { AccountScreen } from "~/pages/account";

export type AccountStackParamList = {
  Profile: undefined;
};

export type AccountScreenNavigationProp =
  NativeStackNavigationProp<AccountStackParamList>;

const Stack = createNativeStackNavigator<AccountStackParamList>();

export const AccountStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={AccountScreen}
        options={{ headerTitle: () => <Logo /> }}
      />
    </Stack.Navigator>
  );
};
