import type { Meta, StoryObj } from "@storybook/react";

import { HeroSection } from "./hero-section";

const meta: Meta<typeof HeroSection> = {
  title: "UI/Landing/HeroSection",
  component: HeroSection,
};

export default meta;

type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {},
};
