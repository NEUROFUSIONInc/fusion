import React, { useContext } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button } from "../../button";
import { ChevronDown } from "../../icons";

import { Streaks } from "~/components/streaks";
import { InsightContext } from "~/contexts";

export const InsightsHeader = () => {
  const insightContext = useContext(InsightContext);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Pressable
        className="flex flex-row"
        onPress={() => {
          Alert.alert(
            "Set Insights Period",
            "How will you like to view your responses over time?",
            [
              {
                text: "Weekly",
                onPress: () => insightContext?.setInsightPeriod("week"),
              },
              {
                text: "Monthly",
                onPress: () => insightContext?.setInsightPeriod("month"),
              },
            ]
          );
        }}
      >
        <Text className="font-sans-bold text-[26px] text-white">
          {insightContext?.insightPeriod === "week" ? "Weekly" : "Monthly"}
        </Text>
        <Button variant="ghost" size="icon" leftIcon={<ChevronDown />} />
      </Pressable>

      <Streaks />
    </View>
  );
};
