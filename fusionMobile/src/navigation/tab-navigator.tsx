import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ComponentType } from "react";
import { View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { AccountStack } from "./account-navigator";
import { HealthStack } from "./health-navigator";
import { PromptStack } from "./prompt-navigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuestStack } from "./quest-navigator";

import {
  Home as HomeIcon,
  Bulb as BulbIcon,
  HeartHandShake as HeartHandShakeIcon,
  Users as UsersIcon,
  ChartArcs as ChartArcsIcon,
} from "~/components";
import { HomeScreen } from "~/pages";

type TabParamList = {
  Home: undefined;
  PromptNavigator: undefined;
  InsightsNavigator: undefined;
  QuestNavigator: undefined;
  Community: undefined;
};

type TabType = {
  name: keyof TabParamList;
  component: ComponentType<any>;
  label: string;
};

type TabIconsType = {
  [key in keyof TabParamList]: (props: SvgProps) => JSX.Element;
};

const CustomTab = createBottomTabNavigator<TabParamList>();

const tabsIcons: TabIconsType = {
  Home: (props: SvgProps) => <HomeIcon {...props} />,
  PromptNavigator: (props: SvgProps) => <BulbIcon {...props} />,
  InsightsNavigator: (props: SvgProps) => <ChartArcsIcon {...props} />,
  QuestNavigator: (props: SvgProps) => <HeartHandShakeIcon {...props} />,
  Community: (props: SvgProps) => <UsersIcon {...props} />,
};

export type TabList<T extends keyof TabParamList> = {
  navigation: NativeStackNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};

const tabs: TabType[] = [
  // {
  //   name: "Home",
  //   component: HomeScreen,
  //   label: "Home",
  // },
  {
    name: "PromptNavigator",
    component: PromptStack,
    label: "Prompts",
  },
  // {
  //   name: "InsightsNavigator",
  //   component: HealthStack,
  //   label: "Insights",
  // },
  // {
  //   name: "QuestNavigator",
  //   component: QuestStack,
  //   label: "Quests",
  // },
  {
    name: "Community",
    component: AccountStack,
    label: "Community",
  },
];

type BarIconType = {
  name: keyof TabParamList;
  color: string;
};

const BarIcon = ({ color, name, ...reset }: BarIconType) => {
  const Icon = tabsIcons[name];
  return <Icon color={color} {...reset} />;
};

export const CustomNavigation = () => {
  return (
    <CustomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: tabs.find((tab) => tab.name === route.name)?.label,
        tabBarLabelStyle: {
          fontFamily: "wsh-reg",
          fontSize: 12,
          marginTop: -8,
        },
        tabBarActiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#0B0816",
          alignItems: "center",
          marginBottom: 20,
          paddingHorizontal: 10,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.15)",
        },
        tabBarIcon: ({ color }) => (
          <BarIcon name={route.name as keyof TabParamList} color={color} />
        ),
      })}
    >
      <CustomTab.Group
        screenOptions={{
          headerShown: false,
        }}
      >
        {tabs.map(({ name, component, label }) => {
          return (
            <CustomTab.Screen
              key={name}
              name={name}
              component={component}
              options={{
                title: label,
              }}
            />
          );
        })}
      </CustomTab.Group>
    </CustomTab.Navigator>
  );
};
