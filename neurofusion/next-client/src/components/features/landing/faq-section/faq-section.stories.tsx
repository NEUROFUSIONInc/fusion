import type { Meta, StoryObj } from "@storybook/react";

import { FaqSection } from "./faq-section";

const meta: Meta<typeof FaqSection> = {
  title: "UI/Landing/FaqSection",
  component: FaqSection,
};

export default meta;

type Story = StoryObj<typeof FaqSection>;

export const Default: Story = {
  args: {},
};
