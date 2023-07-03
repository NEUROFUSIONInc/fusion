import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

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
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
