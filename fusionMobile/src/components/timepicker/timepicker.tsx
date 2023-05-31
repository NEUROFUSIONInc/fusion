import { Entypo } from "@expo/vector-icons";
import dayjs from "dayjs";
import { FC, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { DayChip } from "../day-chip";
import { Select } from "../select";

import { promptFrequencyData } from "./data";

import { NotificationConfigDays, Days } from "~/@types";

export type TimePickerProps = {
  start: dayjs.Dayjs;
  setStart: (time: dayjs.Dayjs) => void;
  end: dayjs.Dayjs;
  setEnd: (time: dayjs.Dayjs) => void;
  days: NotificationConfigDays;
  setDays: (days: NotificationConfigDays) => void;
  transparent?: boolean;
};

export const TimePicker: FC<TimePickerProps> = ({
  start,
  setStart,
  end,
  setEnd,
  days,
  setDays,
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

  const handleStartTimeConfirm = (selectedTime: Date) => {
    console.log("startTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || start;
    setStart(currentTime);
    hideStartTimePicker();
  };
  const handleEndTimeConfirm = (selectedTime: Date) => {
    console.log("endTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || end;
    setEnd(currentTime);
    hideEndTimePicker();
  };

  return (
    <View>
      <View>
        <Text className="font-sans text-white text-lg mb-4">
          When do you want to be prompted?
        </Text>
        <View className="flex py-5 px-4 rounded-md bg-secondary-900 divide-y divide-white/20 divide-opacity-10 items-start flex-col w-full">
          <Pressable
            onPress={showStartTimePicker}
            className="flex flex-row w-full pb-4 justify-between"
          >
            <Text className="font-sans text-base text-white">Between</Text>
            <Text className="flex font-sans text-base text-white">
              {start.format("h:mma")}
              <Entypo name="chevron-small-right" size={15} color="white" />
            </Text>
            <DateTimePickerModal
              isVisible={isStartTimePickerVisible}
              mode="time"
              date={start.toDate()}
              onConfirm={handleStartTimeConfirm}
              onCancel={hideStartTimePicker}
            />
          </Pressable>
          <Pressable
            onPress={showEndTimePicker}
            className="flex flex-row w-full pt-4 justify-between"
          >
            <Text className="font-sans text-base text-white">And</Text>
            <Text className="flex font-sans text-base text-white">
              {end.format("h:mma")}
              <Entypo name="chevron-small-right" size={15} color="white" />
            </Text>
            <DateTimePickerModal
              isVisible={isEndTimePickerVisible}
              mode="time"
              date={end.toDate()}
              onConfirm={handleEndTimeConfirm}
              onCancel={hideEndTimePicker}
            />
          </Pressable>
        </View>
      </View>
      <View>
        <Text className="font-sans text-white text-lg my-4">
          How often should we prompt you?
        </Text>
        <View>
          <Select
            items={promptFrequencyData}
            value={value}
            setValue={setValue}
          />
        </View>
      </View>
      <View className="-z-10">
        <Text className="font-sans text-white text-lg my-4 -z-10">
          What days should we prompt you?
        </Text>
        <View className="flex justify-evenly w-full px-5 py-4 flex-row bg-secondary-900 rounded-md -z-10">
          {Object.keys(days).map((day) => (
            <DayChip
              key={Math.random()}
              day={day}
              isChecked={days[day as Days]}
              onValueChange={(value) => setDays({ ...days, [day]: value })}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
