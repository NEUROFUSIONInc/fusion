import type { Meta } from "@storybook/react-native";
import dayjs from "dayjs";
import { View } from "react-native";

import { TimePicker } from "./timepicker";

import { NotificationConfigDays } from "~/@types";

const meta: Meta<typeof TimePicker> = {
  title: "ui/TimePicker",
  component: TimePicker,
};

export default meta;

export const Primary = () => {
  const start = dayjs().startOf("day").add(8, "hour");
  const end = start.endOf("day").subtract(2, "hour").add(1, "minute");

  return (
    <View className="flex p-4 h-full bg-dark">
      <TimePicker
        days={
          {
            monday: false,
            tuesday: true,
            wednesday: false,
            thursday: true,
            friday: false,
            saturday: true,
            sunday: true,
          } as NotificationConfigDays
        }
        end={end}
        start={start}
        setEnd={() => {}}
        setStart={() => {}}
        setDays={() => {}}
      />
    </View>
  );
};
