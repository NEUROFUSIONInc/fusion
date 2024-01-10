import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";

import { ButtonLink } from "./button-link";

const meta: Meta<typeof ButtonLink> = {
  title: "UI/ButtonLink",
  component: ButtonLink,
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

type Story = StoryObj<typeof ButtonLink>;

export const Primary: Story = {
  args: {
    children: "Button Link",
    intent: "primary",
    size: "md",
    href: "#",
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    ...Primary.args,
    children: "Icon Button Link",
    rightIcon: <Plus size={16} />,
  },
};
