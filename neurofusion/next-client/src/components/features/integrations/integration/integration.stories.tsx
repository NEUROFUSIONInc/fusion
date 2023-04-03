import type { Meta, StoryObj } from "@storybook/react";

import { integrations } from "../data";

import { Integration } from "./integration";

const meta: Meta<typeof Integration> = {
  title: "UI/Features/Integration",
  component: Integration,
};

export default meta;

type Story = StoryObj<typeof Integration>;

export const Default: Story = {
  args: {
    integration: integrations[0],
  },
};
