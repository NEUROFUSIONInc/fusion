import { FontAwesome } from "@expo/vector-icons";
import { FC, useState } from "react";
import { Pressable, Text } from "react-native";

import colors from "~/theme/colors";

export interface OptionProps {
  isChecked: boolean;
  text: string;
  onChange?: (value: boolean) => void;
}

export const Option: FC<OptionProps> = ({ onChange, text, isChecked }) => {
  const [checked, setChecked] = useState(isChecked);

  const onValueChange = () => {
    setChecked(!checked);
    onChange?.(!checked);
  };

  return (
    <Pressable
      className={`flex flex-row items-center justify-start rounded-md w-full h-12 border-2 ${
        checked ? "border-white" : "border-gray-400"
      }`}
      onPress={onValueChange}
    >
      <FontAwesome
        size={14}
        name={checked ? "check-circle" : "circle-o"}
        color="white"
        style={{
          marginHorizontal: 10,
          borderColor: checked ? "white" : colors.light,
          backgroundColor: "transparent",
          color: checked ? "white" : colors.light,
        }}
      />
      <Text
        className={`font-sans text-base ${
          checked ? "text-white" : `text-gray-400`
        }`}
      >
        {text}
      </Text>
    </Pressable>
  );
};
