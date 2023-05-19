import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

import { AccountStack } from "./account-navigator";
import { PromptStack } from "./prompt-navigator";

const Tab = createMaterialBottomTabNavigator();

export const FusionNavigation = () => {
  return (
    <Tab.Navigator
      activeColor="#023059"
      initialRouteName="Prompts"
      barStyle={{ height: 70, marginBottom: 20 }}
    >
      <Tab.Screen
        name="Prompts"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="head-question"
              color={color}
              size={20}
            />
          ),
        }}
        component={PromptStack}
      />

      {/* <Tab.Screen
        name="Health"
        component={HealthStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="heart-pulse"
              color={color}
              size={20}
            />
          ),
        }}
      /> */}

      {/* <Tab.Screen
        name="Quests"
        component={HealthStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="road-variant"
              color={color}
              size={20}
            />
          ),
        }}
      /> */}

      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={20} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
