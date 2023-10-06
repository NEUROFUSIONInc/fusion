import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { HomeHeader } from "~/components/prompts/headers/home-header";
import { SettingsScreen } from "~/pages";
import { HomeScreen } from "~/pages/home";

export type HomeStackParamList = {
  HomePage: undefined;
  SettingsPage: undefined;
};
export type HomeScreenNavigationProp =
  NativeStackNavigationProp<HomeStackParamList>;

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <HomeHeader />,
      }}
    >
      <Stack.Screen name="HomePage" component={HomeScreen} />
      <Stack.Screen name="SettingsPage" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
