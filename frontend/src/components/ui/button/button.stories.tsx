import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    fullWidth: {
      type: "boolean",
      defaultValue: false,
    },
    isLoading: {
      type: "boolean",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      defaultValue: false,
    },
    rounded: {
      type: "boolean",
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
    intent: "primary",
    size: "md",
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    ...Primary.args,
    children: "Icon Button",
    rightIcon: <Plus size={16} />,
  },
};

export const Ghost: Story = {
  args: {
    ...Primary.args,
    intent: "ghost",
    children: "Ghost Button",
    rightIcon: <Plus size={16} />,
  },
};
