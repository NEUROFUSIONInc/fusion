import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { Option, OptionProps } from "./option";

const meta: Meta<OptionProps> = {
  title: "ui/Option",
  component: Option,
};

export default meta;

type Story = StoryObj<OptionProps>;

export const Primary: Story = {
  args: {
    text: "Health and fitness",
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Option {...props} />
    </View>
  ),
};
