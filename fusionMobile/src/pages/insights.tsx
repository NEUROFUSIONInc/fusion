import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import {
  State,
  PanGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import { Screen, ChartContainer, Select } from "~/components";
import { usePromptsQuery } from "~/hooks";
import { appInsights } from "~/utils";

export interface InsightsScreenProps {
  activePrompt: Prompt;
}

export function InsightsScreen() {
  const navigation = useNavigation();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Insights",
      properties: {},
    });
  }, []);

  const { data: savedPrompts, isLoading } = usePromptsQuery();

  const [activeChartPrompt, setActiveChartPrompt] = React.useState<
    Prompt | undefined
  >();

  const [chartStartDate, setChartStartDate] = React.useState<dayjs.Dayjs>(
    dayjs().startOf("week")
  );

  const [selectedPromptUuid, setSelectedPromptUuid] =
    React.useState<string>(null);

  React.useEffect(() => {
    if (savedPrompts && savedPrompts.length > 0) {
      setSelectedPromptUuid(savedPrompts[0].uuid);
    }
  }, [isLoading]);
  const handleActivePromptSelect = (promptUuid: string) => {
    const prompt = savedPrompts?.find((p) => p.uuid === promptUuid);
    setActiveChartPrompt(prompt);
  };

  useEffect(() => {
    if (selectedPromptUuid) {
      handleActivePromptSelect(selectedPromptUuid);
    }
  }, [selectedPromptUuid]);

  const onHandlerStateChange = (event: {
    nativeEvent: { state: number; translationX: number };
  }) => {
    if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX < -50
    ) {
      // Check if the swipe is left (translationX is less than -50)
      if (
        chartStartDate.startOf("week").unix() === dayjs().startOf("week").unix()
      ) {
        return;
      }
      setChartStartDate(chartStartDate.add(1, "week"));
    } else if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX > 50
    ) {
      // Check if the swipe is right (translationX is greater than 50)
      setChartStartDate(chartStartDate.subtract(1, "week"));
    }
  };

  return (
    <Screen>
      <View className="flex-1">
        <ScrollView nestedScrollEnabled>
          <>
            <View className="flex flex-row w-full justify-between p-5">
              <Text className="text-base font-sans-bold text-white">
                {chartStartDate.format("MMM D") +
                  " - " +
                  chartStartDate.add(1, "week").format("MMM D")}
              </Text>

              {chartStartDate < dayjs().startOf("week") ? (
                <Text
                  className="text-base font-sans text-[#A7ED58]"
                  onPress={() => setChartStartDate(dayjs().startOf("week"))}
                >
                  View current week
                </Text>
              ) : (
                <Text
                  className="text-base font-sans text-[#A7ED58]"
                  onPress={() => console.log("view all stats")}
                >
                  View all stats
                </Text>
              )}
            </View>

            {/* select the first available prompt */}
            {savedPrompts && savedPrompts.length > 0 && (
              <View className="flex flex-col w-full bg-secondary-900">
                <View className="flex flex-row w-full h-auto justify-between p-3 border-b-2 border-tint rounded-t">
                  <Select
                    items={savedPrompts.map((prompt) => ({
                      label: prompt.promptText,
                      value: prompt.uuid,
                    }))}
                    value={selectedPromptUuid}
                    placeholder="Select prompt"
                    setValue={setSelectedPromptUuid}
                    dropDownDirection="BOTTOM"
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                      indicatorStyle: "white",
                    }}
                  />
                </View>

                <View className="-z-30">
                  <PanGestureHandler
                    onHandlerStateChange={onHandlerStateChange}
                  >
                    <View>
                      {/* this is where the chart is */}
                      {activeChartPrompt && (
                        <ChartContainer
                          prompt={activeChartPrompt}
                          startDate={chartStartDate}
                          timePeriod="week"
                        />
                      )}
                    </View>
                  </PanGestureHandler>
                </View>
              </View>
            )}
          </>
        </ScrollView>
      </View>
    </Screen>
  );
}
