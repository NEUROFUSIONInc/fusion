import type { Meta, StoryObj } from "@storybook/react";

import { fusionFeatures } from "../data";

import { FusionFeature } from "./fusion-feature";

const meta: Meta<typeof FusionFeature> = {
  title: "UI/Landing/FusionFeature",
  component: FusionFeature,
};

export default meta;

type Story = StoryObj<typeof FusionFeature>;

export const Default: Story = {
  args: {
    feature: fusionFeatures[0],
  },
};
