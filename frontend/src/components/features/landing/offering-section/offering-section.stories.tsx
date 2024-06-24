import type { Meta, StoryObj } from "@storybook/react";

import { OfferingSection } from "./offering-section";

const meta: Meta<typeof OfferingSection> = {
  title: "UI/Landing/OfferingSection",
  component: OfferingSection,
};

export default meta;

type Story = StoryObj<typeof OfferingSection>;

export const Default: Story = {
  args: {},
};
