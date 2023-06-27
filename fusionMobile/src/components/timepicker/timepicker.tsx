import dayjs from "dayjs";
import { FC, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { DayChip } from "../day-chip";
import { ChevronRight } from "../icons";
import { Select } from "../select";

import { promptFrequencyData } from "./data";

import { NotificationConfigDays, Days } from "~/@types";
import { calculateContactCount, interpretDaySelection } from "~/utils";

export type TimePickerProps = {
  start: dayjs.Dayjs;
  setStart: (time: dayjs.Dayjs) => void;
  end: dayjs.Dayjs;
  setEnd: (time: dayjs.Dayjs) => void;
  days?: NotificationConfigDays;
  setDays: (days: NotificationConfigDays) => void;
  setPromptCount?: (count: number) => void;
};

export const TimePicker: FC<TimePickerProps> = ({
  start,
  setStart,
  end,
  setEnd,
  days = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
  setDays,
  setPromptCount,
}) => {
  const [isStartTimePickerVisible, setStartTimePickerVisibility] =
    useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [value, setValue] = useState(null);

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };
  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };
  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };
  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  // TODO: make it better, set time
  const [isSingleTime, setIsSingleTime] = useState(false);
  useEffect(() => {
    if (value === 1) {
      setIsSingleTime(true);
      setEnd(start.add(2, "minute"));
    }
  }, [value]);

  const handleStartTimeConfirm = (selectedTime: Date) => {
    console.log("startTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || start;
    console.log("currentTime: ", currentTime);
    setStart(currentTime);
    hideStartTimePicker();
  };
  const handleEndTimeConfirm = (selectedTime: Date) => {
    console.log("endTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || end;
    setEnd(currentTime);
    hideEndTimePicker();
  };

  const propmtFrequencyDataWithDisabled = useMemo(() => {
    return promptFrequencyData.map((item) => {
      const disabled =
        calculateContactCount(start, end, item.value as string) < 1;
      return {
        ...item,
        disabled,
      };
    });
  }, [start, end]);

  const totalContactCount = useMemo(() => {
    return calculateContactCount(start, end, value as unknown as string);
  }, [start, end, value]);

  const interpretDaySelections = useMemo(
    () => interpretDaySelection(days),
    [days]
  );

  return (
    <View>
      <View>
        <View className="mt-8">
          <Select
            label="How often should we prompt you?"
            items={propmtFrequencyDataWithDisabled}
            value={value}
            setValue={setValue}
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
              indicatorStyle: "white",
            }}
            onChangeValue={() => setPromptCount?.(totalContactCount)}
          />
          {value !== null && (
            <Text className="font-sans text-gray-400 text-sm mt-2">
              {`You will be prompted ${totalContactCount} times`}
            </Text>
          )}
        </View>

        <Text className="-z-10 font-sans text-white text-base mb-4 mt-4">
          When do you want to be prompted?
        </Text>
        <View className="-z-10 flex py-5 px-4 rounded-md bg-secondary-900 divide-y divide-white/20 divide-opacity-10 items-start flex-col w-full">
          <Pressable
            onPress={showStartTimePicker}
            className="flex flex-row w-full pb-4 justify-between"
          >
            {isSingleTime ? (
              <Text className="font-sans text-base text-white">At</Text>
            ) : (
              <Text className="font-sans text-base text-white">Between</Text>
            )}

            <View className="flex items-center flex-row">
              <Text className="flex font-sans text-base text-white mr-2">
                {start.format("h:mma")}
              </Text>
              <ChevronRight style={{ marginTop: 1 }} />
            </View>
            <DateTimePickerModal
              isVisible={isStartTimePickerVisible}
              mode="time"
              date={start.toDate()}
              onConfirm={handleStartTimeConfirm}
              onCancel={hideStartTimePicker}
            />
          </Pressable>

          {isSingleTime ? null : (
            <Pressable
              onPress={showEndTimePicker}
              className="flex flex-row w-full pt-4 justify-between"
            >
              <Text className="font-sans text-base text-white">And</Text>
              <View className="flex flex-row items-center">
                <Text className="flex font-sans text-base text-white mr-2">
                  {end.format("h:mma")}
                </Text>
                <ChevronRight style={{ marginTop: 1 }} />
              </View>
              <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                date={end.toDate()}
                onConfirm={handleEndTimeConfirm}
                onCancel={hideEndTimePicker}
              />
            </Pressable>
          )}
        </View>
        {start > end && (
          <Text className="font-sans text-gray-400 my-4">
            End time must be after start time
          </Text>
        )}
      </View>

      <View className="-z-10 mt-4">
        <Text className="font-sans text-white text-base my-4 -z-10">
          What days should we prompt you?
        </Text>
        <View className="flex justify-evenly w-full px-5 py-4 flex-row bg-secondary-900 rounded-md -z-10">
          {Object.keys(days).map((day) => (
            <DayChip
              key={Math.random()}
              day={day}
              isChecked={days[day as Days]}
              handleValueChange={(value) => {
                setDays({ ...days, [day]: value });
              }}
            />
          ))}
        </View>
        <Text className="font-sans text-gray-400 text-sm my-2">
          {interpretDaySelections}
        </Text>
      </View>
    </View>
  );
};
