import type { Meta, StoryObj } from "@storybook/react-native";

import { Logo } from "./logo";

const meta: Meta<typeof Logo> = {
  title: "ui/Logo",
  component: Logo,
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Primary: Story = {};
