import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button } from "../../button";
import { ChevronDown, Help } from "../../icons";

export const InsightsHeader = () => {
  const navigation = useNavigation();

  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    navigation.setParams({ chartPeriod });
  }, [chartPeriod]);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Pressable
        className="flex flex-row"
        onPress={() => {
          Alert.alert(
            "Set Chart Period",
            "Choose how you'd like to group your data",
            [
              {
                text: "Weekly",
                onPress: () => setChartPeriod("week"),
              },
              { text: "Monthly", onPress: () => setChartPeriod("month") },
            ]
          );
        }}
      >
        <Text className="font-sans-bold text-[26px] text-white">
          {chartPeriod === "week" ? "Weekly" : "Monthly"}
        </Text>
        <Button variant="ghost" size="icon" leftIcon={<ChevronDown />} />
      </Pressable>

      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Help />}
        onPress={() =>
          Alert.alert(
            "Navigating the insights page",
            "Swipe left or right on the chart to view insights across weeks or months."
          )
        }
      />
    </View>
  );
};
