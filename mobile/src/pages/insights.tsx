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

import {
  Screen,
  ChartContainer,
  Button,
  Plus,
  CategoryTag,
  CalendarPicker,
  Pencil,
} from "~/components";
import { categories } from "~/config";
import { AccountContext, InsightContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { RouteProp } from "~/navigation";
import { colors } from "~/theme";
import { appInsights } from "~/utils";

export function InsightsScreen() {
  const route = useRoute<RouteProp<"InsightsPage">>();
  const navigation = useNavigation();

  const insightContext = useContext(InsightContext);
  const routeChartPeriod = route.params?.chartPeriod;
  let routeStartDate = route.params?.startDate;

  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Insights",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    if (routeChartPeriod) {
      insightContext?.setInsightPeriod(routeChartPeriod);
    }
  }, []);

  const { data: savedPrompts, isLoading } = usePromptsQuery();

  const [chartStartDate, setChartStartDate] = React.useState<dayjs.Dayjs>(
    dayjs().startOf(insightContext!.insightPeriod)
  );

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

  // TODO: this is conflicting with the values the user sets..
  useEffect(() => {
    setChartStartDate(dayjs().startOf(insightContext!.insightPeriod));
    if (routeStartDate) {
      setChartStartDate(routeStartDate);
      routeStartDate = undefined;
    }
  }, [insightContext!.insightPeriod]);

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
        <>
          <ScrollView
            horizontal
            className="gap-x-3 gap-y-3 pl-2 min-h-[9%] max-h-[9%]"
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

          <CalendarPicker
            selectedDate={chartStartDate}
            setSelectedDate={setChartStartDate}
          />
        </>
      )}

      {savedPrompts && savedPrompts.length > 0 && (
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <View className="flex flex-1 flex-col w-full h-auto justify-between">
              {filteredPrompts?.map((prompt) => (
                <>
                  <View
                    key={prompt.uuid}
                    className="rounded-lg bg-secondary-900 mb-10"
                  >
                    <View className="flex flex-row border-b-[1px] border-tint p-5 justify-between">
                      <Text className="text-lg font-sans text-white max-w-[90%]">
                        {prompt.promptText}
                      </Text>
                      <View className="self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          leftIcon={<Pencil width={25} height={30} />}
                          onPress={() => {
                            navigation.navigate("PromptResponsesPage", {
                              prompt,
                              selectedDate: chartStartDate.format("YYYY-MM-DD"),
                            });
                          }}
                        />
                      </View>
                    </View>

                    <View>
                      <ChartContainer
                        prompt={prompt}
                        startDate={chartStartDate}
                        timePeriod={insightContext!.insightPeriod}
                      />
                    </View>
                  </View>
                </>
              ))}
            </View>
          </ScrollView>
        </PanGestureHandler>
      )}
    </Screen>
  );
}
