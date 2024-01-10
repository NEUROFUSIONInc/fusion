import type { Meta, StoryObj } from "@storybook/react";

import { Logo } from "./logo";

const meta: Meta<typeof Logo> = {
  title: "UI/Logo",
  component: Logo,
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Main: Story = {};

export const LogoWithText: Story = {
  args: {
    withText: true,
  },
};
