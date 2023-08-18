import RNBottomSheet from "@gorhom/bottom-sheet";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { View, Text, Image } from "react-native";
import {
  State,
  PanGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import {
  Screen,
  ChartContainer,
  Select,
  Button,
  Plus,
  AddPromptSheet,
} from "~/components";
import { AccountContext, InsightContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { RouteProp } from "~/navigation";
import { colors } from "~/theme";
import { appInsights, maskPromptId } from "~/utils";

export function InsightsScreen() {
  const route = useRoute<RouteProp<"InsightsPage">>();

  const insightContext = useContext(InsightContext);
  let routePromptUuid = route.params?.promptUuid;

  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Insights",
      properties: {
        sourcePromptId: routePromptUuid ? maskPromptId(routePromptUuid) : null,
        userNpub: accountContext?.userNpub,
      },
    });
  }, []);

  const { data: savedPrompts, isLoading } = usePromptsQuery();

  const [activeChartPrompt, setActiveChartPrompt] = React.useState<
    Prompt | undefined
  >();

  const [chartStartDate, setChartStartDate] = React.useState<dayjs.Dayjs>(
    dayjs().startOf(insightContext!.insightPeriod)
  );

  const [selectedPromptUuid, setSelectedPromptUuid] = React.useState<
    string | undefined
  >(routePromptUuid ? routePromptUuid : savedPrompts?.[0]?.uuid);

  const handleActivePromptSelect = (promptUuid: string) => {
    const prompt = savedPrompts?.find((p) => p.uuid === promptUuid);
    setActiveChartPrompt(prompt);
  };

  useEffect(() => {
    setChartStartDate(dayjs().startOf(insightContext!.insightPeriod));
  }, [insightContext!.insightPeriod]);

  useEffect(() => {
    // we set this once and destroy afterwards
    if (routePromptUuid) {
      setSelectedPromptUuid(routePromptUuid);
      routePromptUuid = null;
    }
  }, [routePromptUuid]);

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
        chartStartDate.startOf(insightContext!.insightPeriod).unix() ===
        dayjs().startOf(insightContext!.insightPeriod).unix()
      ) {
        return;
      }
      setChartStartDate(chartStartDate.add(1, insightContext!.insightPeriod));
    } else if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX > 50
    ) {
      // Check if the swipe is right (translationX is greater than 50)
      setChartStartDate(
        chartStartDate.subtract(1, insightContext!.insightPeriod)
      );
    }
  };

  // Bottom sheets for adding new prompts
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  const handleExpandSheet = useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

  return (
    <Screen>
      {!savedPrompts || savedPrompts?.length === 0 ? (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image source={require("../../assets/pie-chart.png")} />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Hello there, looks like you haven’t logged enough data to track
          </Text>
          <Button
            title="Add your first prompt"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={handleExpandSheet}
            className="self-center"
          />
        </View>
      ) : (
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <ScrollView nestedScrollEnabled>
            <View className="flex flex-row w-full justify-between p-5">
              {insightContext!.insightPeriod === "week" ? (
                <Text className="text-base font-sans-bold text-white">
                  {chartStartDate.format("MMM D") +
                    " - " +
                    chartStartDate
                      .add(1, insightContext!.insightPeriod)
                      .format("MMM D")}
                </Text>
              ) : (
                <Text className="text-base font-sans-bold text-white">
                  {chartStartDate.format("MMMM YYYY")}
                </Text>
              )}

              {chartStartDate <
              dayjs().startOf(insightContext!.insightPeriod) ? (
                <Text
                  className="text-base font-sans text-lime"
                  onPress={() =>
                    setChartStartDate(
                      dayjs().startOf(insightContext!.insightPeriod)
                    )
                  }
                >
                  View current {insightContext!.insightPeriod}
                </Text>
              ) : null}
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
                    value={selectedPromptUuid!}
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
                  <View>
                    {/* this is where the chart is */}
                    {activeChartPrompt && (
                      <ChartContainer
                        prompt={activeChartPrompt}
                        startDate={chartStartDate}
                        timePeriod={insightContext!.insightPeriod}
                      />
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </PanGestureHandler>
      )}

      <AddPromptSheet bottomSheetRef={bottomSheetRef} />
    </Screen>
  );
}
