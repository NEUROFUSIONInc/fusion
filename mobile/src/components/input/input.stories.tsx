import type { Meta, StoryObj } from "@storybook/react-native";

import { Input, InputProps } from "./input";

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
};

export default meta;

type Story = StoryObj<InputProps>;

export const Primary: Story = {
  args: {
    placeholder: "Placeholder",
    label: "Label",
  },
};
