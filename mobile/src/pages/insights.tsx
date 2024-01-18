import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  CategoryTag,
} from "~/components";
import { AccountContext, InsightContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { RouteProp } from "~/navigation";
import { colors } from "~/theme";
import { categories } from "~/config";

import { appInsights, maskPromptId } from "~/utils";

export function InsightsScreen() {
  const route = useRoute<RouteProp<"InsightsPage">>();
  const navigation = useNavigation();

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

  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const categoryPillsToDisplay = useMemo(() => {
    const categoriesToDisplay = categories.filter(
      (category) =>
        savedPrompts?.filter(
          (prompt) => prompt.additionalMeta?.category === category.name
        )?.length! > 0
    );
    return categoriesToDisplay;
  }, [savedPrompts]);
  const handleCategorySelection = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "") {
      return savedPrompts;
    } else {
      return selectedCategory
        ? savedPrompts?.filter(
            (prompt) => prompt.additionalMeta?.category === selectedCategory
          )
        : savedPrompts;
    }
  }, [savedPrompts, selectedCategory]);

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

  /**
   * Ugly work around because react native fails to re-render the dropdown
   * when saved prompt is updated.
   *
   * Tried different approaches open to something better :)
   */
  const [renderDropdown, setRenderDropdown] = React.useState<boolean>(false);
  useEffect(() => {
    if (savedPrompts) {
      setRenderDropdown(false);
    }
  }, [savedPrompts]);
  useEffect(() => {
    if (renderDropdown === false) {
      setRenderDropdown(true);
    }
  }, [renderDropdown]);

  return (
    <Screen>
      {!isLoading && (!savedPrompts || savedPrompts?.length === 0) && (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image source={require("../../assets/pie-chart.png")} />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Hello there, looks like you haven’t logged enough data to track
          </Text>
          <Button
            title="Add your first prompt"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={() => {
              navigation.navigate("QuickAddPrompts");
            }}
            className="self-center"
          />
        </View>
      )}

      {savedPrompts && savedPrompts.length > 0 && (
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <ScrollView nestedScrollEnabled>
            <ScrollView
              horizontal
              className="flex gap-x-3 gap-y-3 pl-2"
              showsHorizontalScrollIndicator={false}
            >
              {categoryPillsToDisplay.map((category) => {
                const name = category.name;
                return (
                  <CategoryTag
                    key={name}
                    title={name}
                    isActive={selectedCategory === name}
                    icon={category.icon}
                    handleValueChange={(checked) =>
                      handleCategorySelection(checked ? name : "")
                    }
                  />
                );
              })}
            </ScrollView>

            {/* now add the date selectors */}
            <ScrollView className="flex flex-row border-b-[1px] mt-5 mb-5 m-2 border-tint">
              {insightContext!.insightPeriod === "month" && (
                // list all the months in the year
                <Text className="text-base text-white p-2">
                  {chartStartDate.format("MMM YYYY")}
                </Text>
              )}
            </ScrollView>

            {/* select the first available prompt */}
            <View className="flex flex-col w-full">
              <View className="flex flex-col w-full h-auto justify-between rounded-lg bg-secondary-900">
                {filteredPrompts?.map((prompt) => (
                  <View key={prompt.uuid}>
                    <View className="border-b-[1px] border-tint p-5">
                      <Text
                        className="text-base font-sans text-white"
                        onPress={() => setSelectedPromptUuid(prompt.uuid)}
                      >
                        {prompt.promptText}
                      </Text>
                    </View>

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
                ))}
              </View>
            </View>
          </ScrollView>
        </PanGestureHandler>
      )}
    </Screen>
  );
}
