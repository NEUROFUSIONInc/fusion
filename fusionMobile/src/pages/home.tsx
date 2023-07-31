import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { View, Text } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

import { Button, ChevronLeft, ChevronRight, Screen } from "../components";

import { Prompt, PromptResponse } from "~/@types";
import { ChartContainer } from "~/components/charts/chart-container";
import { usePromptsQuery } from "~/hooks/usePrompts";
import { promptService } from "~/services";
import { appInsights } from "~/utils";

export function HomeScreen() {
  const navigation = useNavigation();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {},
    });
  }, []);

  const { data: savedPrompts, isLoading } = usePromptsQuery();

  const [activeChartPrompt, setActiveChartPrompt] = React.useState<
    Prompt | undefined
  >();
  const [activeChartPromptResponses, setActiveChartPromptResponses] =
    React.useState<PromptResponse[]>([]);

  const [chartStartDate, setChartStartDate] = React.useState<dayjs.Dayjs>(
    dayjs().startOf("week")
  );
  React.useEffect(() => {
    if (savedPrompts && savedPrompts.length > 0) {
      setActiveChartPrompt(savedPrompts[0]);
    }
    // TODO: order the saved prompts by moving inactive prompts to the end
  }, [isLoading]);

  React.useEffect(() => {
    if (activeChartPrompt) {
      console.log("activeChartPrompt", activeChartPrompt);
      (async () => {
        const res = await promptService.getPromptResponses(
          activeChartPrompt.uuid
        );

        // sort events
        res.sort((a, b) => {
          return a.triggerTimestamp - b.triggerTimestamp;
        });

        setActiveChartPromptResponses(res);
      })();
    }
  }, [activeChartPrompt]);

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

  const panActiveChartPrompt = (direction: "left" | "right") => {
    if (savedPrompts && savedPrompts.length > 0) {
      const currentIndex = savedPrompts.findIndex(
        (prompt) => prompt.uuid === activeChartPrompt?.uuid
      );

      if (direction === "left") {
        if (currentIndex === 0) {
          setActiveChartPrompt(savedPrompts[savedPrompts.length - 1]);
        } else {
          setActiveChartPrompt(savedPrompts[currentIndex - 1]);
        }
      } else {
        if (currentIndex === savedPrompts.length - 1) {
          setActiveChartPrompt(savedPrompts[0]);
        } else {
          setActiveChartPrompt(savedPrompts[currentIndex + 1]);
        }
      }
    }
  };

  return (
    <Screen>
      <View>
        {/* <>
          <View className="flex flex-row w-full justify-between p-5">
            <Text className="text-base font-sans-bold text-white">
              Your health data
            </Text>
            <Text className="text-base font-sans text-[#A7ED58]">Show all</Text>
          </View>

          <Button
            title="Connect to Apple Health"
            onPress={() => console.log("connect to apple health")}
            className="w-full p-5"
            size="md"
          />
        </> */}
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
                {/* this is where the header of the chart is */}
                <Button
                  variant="ghost"
                  size="icon"
                  leftIcon={<ChevronLeft />}
                  onPress={() => panActiveChartPrompt("left")}
                />

                <Text className="font-sans text-base text-white text-[20px] ml-2 w-[80%] text-center">
                  {activeChartPrompt?.promptText}
                </Text>

                <Button
                  variant="ghost"
                  size="icon"
                  leftIcon={<ChevronRight />}
                  onPress={() => panActiveChartPrompt("right")}
                />
              </View>

              <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
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
          )}
        </>

        <Button
          title="Use Fusion Copilot"
          onPress={() => console.log("connect to apple health")}
          className="w-full p-5 mt-10"
          size="md"
        />
      </View>
    </Screen>
  );
}
