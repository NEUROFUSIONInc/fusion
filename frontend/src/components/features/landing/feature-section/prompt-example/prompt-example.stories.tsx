import type { Meta, StoryObj } from "@storybook/react";

import { PromptExample } from "./prompt-example";

const meta: Meta<typeof PromptExample> = {
  title: "UI/Landing/PromptExample",
  component: PromptExample,
};

export default meta;

type Story = StoryObj<typeof PromptExample>;

export const Default: Story = {
  args: {
    title: "Prompt Example",
    leftSubtitle: "Left Subtitle",
    rightSubtitle: "Right Subtitle",
  },
};
