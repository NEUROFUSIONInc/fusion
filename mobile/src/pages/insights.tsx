import { useNavigation, useRoute } from "@react-navigation/native";
import { cva } from "class-variance-authority";
import dayjs from "dayjs";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { View, Text, Image, Pressable } from "react-native";
import {
  State,
  PanGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import {
  Screen,
  ChartContainer,
  Button,
  Plus,
  CategoryTag,
  Pencil,
  Calendar,
} from "~/components";
import { categories } from "~/config";
import { AccountContext, InsightContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { RouteProp } from "~/navigation";
import { colors } from "~/theme";
import { appInsights, maskPromptId } from "~/utils";

export function InsightsScreen() {
  const route = useRoute<RouteProp<"InsightsPage">>();
  const navigation = useNavigation();

  const insightContext = useContext(InsightContext);
  const routePromptUuid = route.params?.promptUuid;

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

  useEffect(() => {
    setChartStartDate(dayjs().startOf(insightContext!.insightPeriod));
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

  const [displayedDates, setDisplayedDates] = useState<dayjs.Dayjs[]>([]);
  useEffect(() => {
    (async () => {
      if (chartStartDate && insightContext!.insightPeriod === "week") {
        const dates = await getWeeksInMonth(chartStartDate);
        setDisplayedDates(dates);
      }
      if (chartStartDate && insightContext!.insightPeriod === "month") {
        const dates = await getLastFourMonths(chartStartDate);
        setDisplayedDates(dates);
      }
    })();
  }, [chartStartDate]);

  const getWeeksInMonth = (selectedDate: dayjs.Dayjs) => {
    /**
     * returns an array of dayjs objects that represent the start
     * of each week in the month
     */
    return new Promise<dayjs.Dayjs[]>((resolve) => {
      const firstDay = selectedDate.startOf("month");
      // if the selected date is in the past, then the last day is the end of the month

      // have to check if it's the current month... then don't
      let lastDay;
      if (selectedDate.get("month") === dayjs().get("month")) {
        lastDay = dayjs().endOf("week");
      } else if (selectedDate < dayjs().startOf("day")) {
        lastDay = selectedDate.endOf("month").subtract(1, "day");
      } else {
        lastDay = dayjs().startOf("day");
      }

      const weeks = [];

      let weekIterator = firstDay.startOf("week");
      while (weekIterator.endOf("week") <= lastDay.endOf("week")) {
        weeks.push(weekIterator);
        weekIterator = weekIterator.add(1, "week"); // Cloning and adding 1 week
      }
      resolve(weeks);
    });
  };

  const getLastFourMonths = (selectedDate: dayjs.Dayjs) => {
    /**
     * returns an array of dayjs objects that represent the start
     * of each month in the last 4 months
     */
    return new Promise<dayjs.Dayjs[]>((resolve) => {
      const firstDay = selectedDate.startOf("month").subtract(3, "month");
      const lastDay = dayjs().startOf("day");

      const months = [];

      let monthIterator = firstDay.startOf("month");
      while (monthIterator.endOf("month") <= lastDay.endOf("month")) {
        months.push(monthIterator);
        monthIterator = monthIterator.add(1, "month"); // Cloning and adding 1 month
      }
      resolve(months);
    });
  };

  const dateTextStyle = cva("text-base font-sans text-gray-400 p-2", {
    variants: {
      active: {
        true: "text-white",
      },
    },
  });

  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleDatePickerConfimm = (date: Date) => {
    if (insightContext!.insightPeriod === "week") {
      setChartStartDate(dayjs(date));
    } else if (insightContext!.insightPeriod === "month") {
      setChartStartDate(dayjs(date).startOf("month"));
    }
    hideDatePicker();
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

      <ScrollView
        horizontal
        className="flex gap-x-3 flex-shrink-0 gap-y-3 pl-2 max-h-[100%]"
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

      <View className="flex flex-row border-b-[1px] my-5 border-tint">
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          maximumDate={dayjs().toDate()}
          minuteInterval={5}
          date={chartStartDate.toDate()} // TODO: revisit this
          onConfirm={handleDatePickerConfimm}
          onCancel={hideDatePicker}
        />
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<Calendar width={20} height={20} />}
          onPress={showDatePicker}
        />
        <ScrollView
          horizontal
          className="flex flex-1 flex-row"
          showsHorizontalScrollIndicator={false}
        >
          {displayedDates.map((date, index) => (
            <Pressable
              onPress={() => {
                setChartStartDate(date.startOf(insightContext!.insightPeriod));
              }}
            >
              <Text
                key={index}
                className={dateTextStyle(
                  date
                    .startOf(insightContext!.insightPeriod)
                    .isSame(
                      chartStartDate.startOf(insightContext!.insightPeriod)
                    )
                    ? { active: true }
                    : {}
                )}
              >
                {insightContext!.insightPeriod === "week" && (
                  <>
                    {date.get("month") !== date.endOf("week").get("month") ? (
                      <>
                        {date.format("MMM D")}-
                        {date.endOf("week").format("MMM D")}
                      </>
                    ) : (
                      <>
                        {date.format("MMM D")}-{date.endOf("week").format("D")}
                      </>
                    )}
                  </>
                )}

                {insightContext!.insightPeriod === "month" && (
                  <>{date.format("MMM YYYY")}</>
                )}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

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
                      <Button
                        variant="ghost"
                        size="icon"
                        leftIcon={<Pencil width={25} height={30} />}
                        onPress={() => {}}
                      />
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
