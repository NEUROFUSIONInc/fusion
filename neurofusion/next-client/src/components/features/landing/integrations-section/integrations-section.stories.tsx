import type { Meta, StoryObj } from "@storybook/react";

import { IntegrationsSection } from "./integrations-section";

const meta: Meta<typeof IntegrationsSection> = {
  title: "UI/Landing/IntegrationsSection",
  component: IntegrationsSection,
};

export default meta;

type Story = StoryObj<typeof IntegrationsSection>;

export const Default: Story = {
  args: {},
};
