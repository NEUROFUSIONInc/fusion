import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  argTypes: {
    fullWidth: {
      type: "boolean",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {
    size: "md",
    label: "Email",
    placeholder: "example@email.com",
  },
};
