import type { Meta, StoryObj } from "@storybook/react";
import { BlogSection } from "./blog-section";

// This is the metadata for your story
const meta: Meta<typeof BlogSection> = {
  title: "UI/Landing/BlogSection",
  component: BlogSection,
};

export default meta;

type Story = StoryObj<typeof BlogSection>;

export const Default: Story = {
  args: {},
};
