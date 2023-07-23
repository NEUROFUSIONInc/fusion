import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

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

  React.useEffect(() => {
    if (savedPrompts && savedPrompts.length > 0) {
      setActiveChartPrompt(savedPrompts[0]);
    }
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

  React.useEffect(() => {
    console.log("activeChartPromptResponses", activeChartPromptResponses);
  }, [activeChartPromptResponses]);

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
      <ScrollView>
        <View className="flex flex-row w-full justify-between p-5">
          <Text className="text-base font-sans-bold text-white">This week</Text>
          <Text className="text-base font-sans text-[#A7ED58]">
            View all stats
          </Text>
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

            <View>
              {/* this is where the chart is */}
              {activeChartPrompt && (
                <ChartContainer
                  prompt={activeChartPrompt}
                  startDate={dayjs().startOf("week")}
                  timePeriod="week"
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
