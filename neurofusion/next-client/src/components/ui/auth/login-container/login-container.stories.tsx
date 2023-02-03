import type { Meta, StoryObj } from "@storybook/react";

import { LoginContainer } from "./login-container";

const meta: Meta<typeof LoginContainer> = {
  title: "UI/Auth/LoginContainer",
  component: LoginContainer,
};

export default meta;

type Story = StoryObj<typeof LoginContainer>;

export const Primary: Story = {};
