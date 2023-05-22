import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, ButtonProps } from "./button";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    title: "Primary",
    variant: "primary",
  },
};
