import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  RouteProp,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { CommunityStack } from "./community-navigator";
import { HomeStack } from "./home-navigator";
import { InsightsStack } from "./insights-navigator";
import { PromptStack } from "./prompt-navigator";

import {
  Home as HomeIcon,
  Bulb as BulbIcon,
  HeartHandShake as HeartHandShakeIcon,
  Users as UsersIcon,
  ChartArcs as ChartArcsIcon,
} from "~/components";

type TabParamList = {
  HomeNavigator: undefined;
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
  HomeNavigator: (props: SvgProps) => <HomeIcon {...props} />,
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
  {
    name: "HomeNavigator",
    component: HomeStack,
    label: "Home",
  },
  {
    name: "PromptNavigator",
    component: PromptStack,
    label: "Prompts",
  },
  {
    name: "InsightsNavigator",
    component: InsightsStack,
    label: "Insights",
  },
  // {
  //   name: "QuestNavigator",
  //   component: QuestStack,
  //   label: "Quests",
  // },
  {
    name: "Community",
    component: CommunityStack,
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
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? "";
        return {
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
            marginBottom: 5,
            paddingHorizontal: 10,
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.15)",
            // display: routeName === "ChatPage" ? "none" : "flex",
            display: "flex",
          },
          tabBarIcon: ({ color }) => (
            <BarIcon name={route.name as keyof TabParamList} color={color} />
          ),
        };
      }}
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
