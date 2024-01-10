import type { Meta, StoryObj } from "@storybook/react";

import { Footer } from "./footer";

const meta: Meta<typeof Footer> = {
  title: "UI/Layouts/Footer",
  component: Footer,
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {},
};
