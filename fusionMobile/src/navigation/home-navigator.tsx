import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { HomeHeader } from "~/components/prompts/headers/home-header";
import { HomeScreen } from "~/pages/home";

export type HomeStackParamList = {
  HomePage: undefined;
};

export type AccountScreenNavigationProp =
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
    </Stack.Navigator>
  );
};
