import { FC } from "react";
import { Pressable, PressableProps, Text } from "react-native";

import { ChevronRight } from "../../icons";

interface PromptOptionProps extends PressableProps {
  text: string;
}

export const PromptOption: FC<PromptOptionProps> = ({ text, ...props }) => {
  return (
    <Pressable
      className="bg-tint rounded-md w-full h-14 px-4 flex flex-row items-center justify-between active:opacity-80"
      {...props}
    >
      <Text className="font-sans text-base text-white">{text}</Text>
      <ChevronRight />
    </Pressable>
  );
};
