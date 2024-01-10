import type { Meta, StoryObj } from "@storybook/react";

import { Navbar } from "./navigation";

const meta: Meta<typeof Navbar> = {
  title: "UI/Layouts/Navigation",
  component: Navbar,
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {},
};
