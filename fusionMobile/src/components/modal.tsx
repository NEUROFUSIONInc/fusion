import React from "react";
import { View, Text } from "react-native";

import { Button } from "./button";

interface ModalProps {
  message: string;
  clickText: string;
  clickAction: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  message,
  clickText,
  clickAction,
}) => {
  return (
    <View className="flex flex-1 w-full h-full bg-secondary-900 absolute justify-center p-5 b">
      <Text className="font-sans text-base text-white text-center mb-10">
        {message}
      </Text>
      <Button
        className="rounded flex items-center justify-center"
        onPress={clickAction}
        fullWidth
        title={clickText}
      />
    </View>
  );
};
