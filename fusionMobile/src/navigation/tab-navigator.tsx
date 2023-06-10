import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import React from "react";
import { AccountStack } from "./account-navigator";
import { PromptStack } from "./prompt-navigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuestStack } from "./quest-navigator";

const Tab = createMaterialBottomTabNavigator();

export const FusionNavigation = () => {
  const [researchOptIn, setResearchOptIn] = React.useState("false");

  React.useEffect(() => {
    const getResearchOptIn = async () => {
      const val = await AsyncStorage.getItem("researchProgramMember");
      if (val) {
        setResearchOptIn(val);
      }
    };
    getResearchOptIn();
  });

  return (
    <Tab.Navigator activeColor="#023059" initialRouteName="Prompts">
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

      {researchOptIn == "true" && (
        <Tab.Screen
          name="Quests"
          component={QuestStack}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="road-variant"
                color={color}
                size={20}
              />
            ),
          }}
        />
      )}

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
