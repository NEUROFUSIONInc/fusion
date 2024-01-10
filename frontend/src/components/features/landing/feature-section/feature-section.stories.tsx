import type { Meta, StoryObj } from "@storybook/react";

import { FeatureSection } from "./feature-section";

const meta: Meta<typeof FeatureSection> = {
  title: "UI/Landing/FeatureSection",
  component: FeatureSection,
};

export default meta;

type Story = StoryObj<typeof FeatureSection>;

export const Default: Story = {
  args: {},
};
