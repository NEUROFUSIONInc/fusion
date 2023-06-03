import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { Tag, TagProps } from "./tag";

const meta: Meta<typeof Tag> = {
  title: "ui/Tag",
  component: Tag,
};

export default meta;

type Story = StoryObj<TagProps>;

export const Primary: Story = {
  args: {
    title: "Health and fitness",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Tag {...props} />
    </View>
  ),
};

export const Active: Story = {
  args: {
    title: "Secondary",
    active: true,
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Tag {...props} />
    </View>
  ),
};

export const Tags: Story = {
  args: {
    title: "Productivity",
  },
  render: (props) => (
    <View className="flex-1 flex-row gap-2.5 space-y-2.5 h-full flex-wrap p-4 bg-dark">
      <Tag {...props} />
      <Tag {...props} title="Health and Fitness" />
      <Tag {...props} title="Finance" />
      <Tag {...props} title="Education" />
      <Tag {...props} title="Relationships" />
      <Tag {...props} title="Sustainability" />
      <Tag {...props} active />
      <Tag {...props} title="Mental Health" />
      <Tag {...props} title="Spiritual Practice" />
    </View>
  ),
};
