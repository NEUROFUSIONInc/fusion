import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Screen, Button, ChevronLeft, ChevronRight } from "~/components";
import { categories } from "~/config";
import { usePromptsQuery } from "~/hooks";
import { appInsights } from "~/utils";

export function HomeScreen() {
  const navigation = useNavigation();
  const { data: savedPrompts, isLoading } = usePromptsQuery();

  // get all the categories
  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState(0);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {},
    });
  }, []);

  const panActiveInsightCategory = (direction: "left" | "right") => {
    if (direction === "left") {
      if (activeCategoryIndex === 0) {
        setActiveCategoryIndex(categories.length - 1);
      } else {
        setActiveCategoryIndex(activeCategoryIndex - 1);
      }
    } else if (direction === "right") {
      if (activeCategoryIndex === categories.length - 1) {
        setActiveCategoryIndex(0);
      } else {
        setActiveCategoryIndex(activeCategoryIndex + 1);
      }
    }
  };

  const getInsightSummary = (category: string) => {
    // find all the prompts that have this category
    // for starters just pick the first one
    // take prompt data for the current week
    // take prompt data for the past week
  };

  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-row w-full justify-between p-5">
          <Text className="text-base font-sans-bold text-white">
            Fusion Digest
          </Text>
        </View>

        {/* show each category at a time */}
        {/* {savedPrompts && savedPrompts.length > 0 && ( */}
        <View className="flex flex-col w-full bg-secondary-900">
          <View className="flex flex-row w-full h-auto justify-between p-3 border-b-2 border-tint rounded-t">
            {/* this is where the header of the chart is */}
            <Button
              variant="ghost"
              size="icon"
              leftIcon={<ChevronLeft />}
              onPress={() => panActiveInsightCategory("left")}
            />

            <Text className="font-sans text-base text-white text-[20px] ml-2 w-[80%] text-center">
              {categories[activeCategoryIndex].icon}{" "}
              {categories[activeCategoryIndex].name}
            </Text>

            <Button
              variant="ghost"
              size="icon"
              leftIcon={<ChevronRight />}
              onPress={() => panActiveInsightCategory("right")}
            />
          </View>

          <View>
            <Text
              ellipsizeMode="tail"
              className="font-sans flex flex-wrap text-white text-base font-medium m-5"
            >
              {
                "Based on the responses, it seems like your overall mood has been fluctuating between hopeful, excited, neutral, anxious, tired, happy, content, and foggy. It's important to note that it's completely normal to experience different emotions and moods throughout different days.\n\nTo better support your mental health, here are a few suggested actions:\n\n1. Practice self-care: Take some time each day to engage in activities that bring you joy and help you relax. This could include hobbies, exercise, meditation, or spending time with loved ones.\n2. Seek support: If you're feeling overwhelmed or anxious, consider reaching out to a trusted friend, family member, or mental health professional. Talking about your feelings can provide comfort and guidance.\n3. Prioritize rest: It appears that you have been feeling tired on certain days. Make sure you are getting enough sleep and allowing yourself breaks throughout the day to recharge.\n4. Maintain hope: Hold onto the hopeful moments and focus on the things that bring you optimism. Surround yourself with positive influences and remind yourself of the things you are looking forward to.\n\nRemember, everyone's mental health journey is unique, and it's important to take the necessary steps to support yourself. Take care!"
              }
            </Text>
          </View>
        </View>

        {/* connect your apple health data */}
      </ScrollView>
    </Screen>
  );
}
