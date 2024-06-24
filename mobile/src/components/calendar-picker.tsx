import { cva } from "class-variance-authority";
import dayjs from "dayjs";
import React, { FC, useContext, useState, useEffect } from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Button } from "./button";
import { Calendar, ChevronRightSmall } from "./icons";

import { InsightContext } from "~/contexts";

export type CalendarPickerProps = {
  selectedDate: dayjs.Dayjs;
  setSelectedDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
};

export const CalendarPicker: FC<CalendarPickerProps> = ({
  selectedDate,
  setSelectedDate,
}) => {
  const insightContext = useContext(InsightContext);

  const [displayedDates, setDisplayedDates] = useState<dayjs.Dayjs[]>([]);

  const getWeeksInMonth = (selectedDate: dayjs.Dayjs) => {
    /**
     * returns an array of dayjs objects that represent the start
     * of each week in the month
     */
    return new Promise<dayjs.Dayjs[]>((resolve) => {
      const firstDay = selectedDate.startOf("week").startOf("month");
      // if the selected date is in the past, then the last day is the end of the month

      // have to check if it's the current month... then don't
      let lastDay;
      if (firstDay.get("month") === dayjs().get("month")) {
        lastDay = dayjs().endOf("week");
      } else if (firstDay < dayjs().startOf("day")) {
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

  const getDaysInWeek = (selectedDate: dayjs.Dayjs) => {
    return new Promise<dayjs.Dayjs[]>((resolve) => {
      const firstDay = selectedDate.startOf("week");
      const lastDay = selectedDate.endOf("week");

      const days = [];

      let dayIterator = firstDay.startOf("day");
      while (
        dayIterator <= lastDay.endOf("day") &&
        dayIterator <= dayjs().endOf("day")
      ) {
        days.push(dayIterator);
        dayIterator = dayIterator.add(1, "day");
      }
      resolve(days);
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
    if (["week", "day"].includes(insightContext!.insightPeriod)) {
      setSelectedDate(dayjs(date));
    } else if (insightContext!.insightPeriod === "month") {
      setSelectedDate(dayjs(date).startOf("month"));
    }
    hideDatePicker();
  };

  useEffect(() => {
    (async () => {
      if (selectedDate && insightContext!.insightPeriod === "week") {
        const dates = await getWeeksInMonth(selectedDate);
        setDisplayedDates(dates);
      }
      if (selectedDate && insightContext!.insightPeriod === "month") {
        const dates = await getLastFourMonths(selectedDate);
        setDisplayedDates(dates);
      }
      if (selectedDate && insightContext!.insightPeriod === "day") {
        const dates = await getDaysInWeek(selectedDate);
        setDisplayedDates(dates);
      }
    })();
  }, [selectedDate]);

  return (
    <View className="flex flex-row border-b-[1px] mt-3 mb-5 border-tint items-center">
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={dayjs().toDate()}
        date={selectedDate.toDate()}
        onConfirm={handleDatePickerConfimm}
        onCancel={hideDatePicker}
      />
      <View className="self-center">
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<Calendar width={20} height={20} />}
          onPress={showDatePicker}
        />
      </View>
      <ScrollView
        horizontal
        className="flex flex-1 flex-row"
        showsHorizontalScrollIndicator={false}
      >
        <>
          {displayedDates.map((date, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedDate(date.startOf(insightContext!.insightPeriod));
              }}
            >
              <Text
                className={dateTextStyle(
                  date
                    .startOf(insightContext!.insightPeriod)
                    .isSame(selectedDate.startOf(insightContext!.insightPeriod))
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

                {insightContext!.insightPeriod === "day" && (
                  <>{date.format("MMM DD")}</>
                )}
              </Text>
            </Pressable>
          ))}

          {/* Display right arrow */}
          {insightContext?.insightPeriod !== "day" &&
            selectedDate.endOf("month").isBefore(dayjs().endOf("month")) && (
              <View className="self-center">
                <Button
                  variant="ghost"
                  size="icon"
                  leftIcon={
                    <ChevronRightSmall width={20} height={20} color="#9ca3af" />
                  }
                  onPress={() => {
                    setSelectedDate(
                      selectedDate.add(1, "month").startOf("month").endOf("day")
                    );
                  }}
                />
              </View>
            )}

          {insightContext?.insightPeriod === "day" &&
            selectedDate.endOf("week").isBefore(dayjs().endOf("week")) && (
              <View className="self-center">
                <Button
                  variant="ghost"
                  size="icon"
                  leftIcon={
                    <ChevronRightSmall width={20} height={20} color="#9ca3af" />
                  }
                  onPress={() => {
                    setSelectedDate(
                      selectedDate.add(1, "month").startOf("month")
                    );
                  }}
                />
              </View>
            )}
        </>
      </ScrollView>
    </View>
  );
};
