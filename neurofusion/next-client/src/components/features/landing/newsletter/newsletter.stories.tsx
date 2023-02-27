import type { Meta, StoryObj } from "@storybook/react";

import { Newsletter } from "./newsletter";

const meta: Meta<typeof Newsletter> = {
  title: "UI/Landing/Newsletter",
  component: Newsletter,
};

export default meta;

type Story = StoryObj<typeof Newsletter>;

export const Default: Story = {
  args: {},
};
