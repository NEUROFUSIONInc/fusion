import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { Button, ButtonProps } from "./button";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    title: "Welcome to Fusion",
    variant: "primary",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Button {...props} />
    </View>
  ),
};

export const Rounded: Story = {
  args: {
    title: "Hello",
    variant: "primary",
    rounded: true,
  },
  render: (props) => (
    <View className="flex-1 flex-row space-x-4 flex-nowrap h-full p-4 bg-dark">
      <Button {...props} />
      <Button {...props} variant="outline" />
    </View>
  ),
};

export const Secondary: Story = {
  args: {
    title: "Secondary",
    variant: "secondary",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-white">
      <Button {...props} />
    </View>
  ),
};

export const Outline: Story = {
  args: {
    title: "Outline",
    variant: "outline",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Button {...props} />
    </View>
  ),
};

export const OutlineDark: Story = {
  args: {
    title: "Outline Dark",
    variant: "outline-dark",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-white">
      <Button {...props} />
    </View>
  ),
};

export const Disabled: Story = {
  args: {
    title: "Disabled",
    variant: "primary",
    disabled: true,
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Button {...props} />
    </View>
  ),
};

export const Loading: Story = {
  args: {
    title: "Loading",
    variant: "primary",
    loading: true,
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Button {...props} />
    </View>
  ),
};
