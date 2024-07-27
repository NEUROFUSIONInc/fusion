import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  AccountHeader,
  ChatHeader,
  HealthHeader,
  HomeHeader,
} from "~/components/headers";
import { AccountScreen, HealthScreen, SettingsScreen } from "~/pages";
import { BookingScreen } from "~/pages/booking";
import { ChatScreen } from "~/pages/chat";
import { HomeScreen } from "~/pages/home";

export type HomeStackParamList = {
  HomePage: undefined;
  SettingsPage: undefined;
  AccountPage: undefined;
  ChatPage: undefined;
  BookingPage: undefined;
  HealthPage: undefined;
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
      <Stack.Screen
        name="AccountPage"
        component={AccountScreen}
        options={{ header: () => <AccountHeader /> }}
      />
      <Stack.Screen
        name="ChatPage"
        component={ChatScreen}
        options={{
          header: () => <ChatHeader />,
        }}
      />
      <Stack.Screen
        name="BookingPage"
        component={BookingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HealthPage"
        component={HealthScreen}
        options={{ header: () => <HealthHeader /> }}
      />
    </Stack.Navigator>
  );
};
