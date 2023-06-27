import { FC } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";

import { ChevronRight } from "../../icons";

interface PromptOptionProps extends PressableProps {
  text: string;
  icon?: React.ReactElement;
}

export const PromptOption: FC<PromptOptionProps> = ({
  text,
  icon,
  ...props
}) => {
  return (
    <Pressable
      className="bg-tint rounded-md w-full h-14 px-4 flex flex-row items-center justify-between active:opacity-80"
      {...props}
    >
      <View className="flex flex-row items-center gap-x-2">
        {icon && icon}
        <Text className="font-sans text-base text-white">{text}</Text>
      </View>
      <ChevronRight />
    </Pressable>
  );
};
