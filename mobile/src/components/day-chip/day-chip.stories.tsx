import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { DayChip, DayChipProps } from "./day-chip";

import { DaysArray } from "~/@types";

function getDaysArray(): DaysArray {
  return [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
}

const meta: Meta<DayChipProps> = {
  title: "ui/DayChip",
  component: DayChip,
  // argTypes: { onValueChange: { action: "clicked" } },
};

export default meta;

type Story = StoryObj<DayChipProps>;

export const Primary: Story = {
  args: {
    day: "Monday",
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <DayChip {...props} />
    </View>
  ),
};

export const Active: Story = {
  args: {
    day: "Tuesday",
    isChecked: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <View className="w-8 h-8">
        <DayChip {...props} />
      </View>
    </View>
  ),
};

export const DayChips: Story = {
  args: {
    day: "Monday",
  },
  render: (props) => {
    const day = new Date().getDay();
    const activeDay = getDaysArray()[day];

    return (
      <View className="flex w-full flex-row h-full justify-evenly flex-nowrap overflow-x-scroll p-4 bg-dark">
        {getDaysArray().map((day) => (
          <DayChip
            {...props}
            key={day}
            day={day}
            isChecked={day === activeDay}
            handleValueChange={(value) =>
              console.log(`${day} clicked - ${value}`)
            }
          />
        ))}
      </View>
    );
  },
};
