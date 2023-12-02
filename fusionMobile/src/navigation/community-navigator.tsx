import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { CommunityScreen } from "~/pages";

export type CommunityStackParamList = {
  CommunityPage: undefined;
};

export type CommunityScreenNavigationProp =
  NativeStackNavigationProp<CommunityStackParamList>;

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CommunityPage"
        component={CommunityScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
