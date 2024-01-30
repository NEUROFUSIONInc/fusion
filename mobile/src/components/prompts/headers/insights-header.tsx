import React, { useContext } from "react";
import { Alert, View } from "react-native";

import { Button } from "../../button";
import { ChevronDown } from "../../icons";

import { Streaks } from "~/components/streaks";
import { InsightContext } from "~/contexts";

export const InsightsHeader = () => {
  const insightContext = useContext(InsightContext);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        rightIcon={<ChevronDown />}
        title={insightContext?.insightPeriod === "week" ? "Weekly" : "Monthly"}
        textSize="bold"
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
      />
      <Streaks />
    </View>
  );
};
