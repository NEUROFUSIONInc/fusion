import type { Meta, StoryObj } from "@storybook/react";

import { DashboardLayout } from "./dashboard-layout";

const meta: Meta<typeof DashboardLayout> = {
  title: "UI/Layouts/DashboardLayout",
  component: DashboardLayout,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof DashboardLayout>;

export const Default: Story = {
  args: {
    children: "Test",
  },
};
