import type { Meta } from "@storybook/react-native";
import { View } from "react-native";

import { CustomNavigation } from "./tab-navigator";

import { PromptContextProvider } from "~/utils";

const meta: Meta<typeof CustomNavigation> = {
  title: "ui/Navigation Menu",
  component: CustomNavigation,
};

export default meta;

export const NavigationMenu = () => {
  return (
    <View className="flex h-full w-full bg-dark">
      <PromptContextProvider>
        <CustomNavigation />
      </PromptContextProvider>
    </View>
  );
};
