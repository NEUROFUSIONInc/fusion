import React from "react";
import { View, Text } from "react-native";

import { Button } from "./button";

interface ModalProps {
  message: string;
  clickText: string;
  overlay?: boolean;
  clickAction: () => void;
  dismissAction: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  message,
  clickText,
  clickAction,
  dismissAction,
  overlay = true,
}) => {
  const overlayStyle = overlay ? "absolute inset-0 bg-black bg-opacity-50" : "";
  return (
    <View
      className={`flex flex-1 w-full bg-secondary-900 justify-center p-5 rounded items-center h-full ${overlayStyle}`}
    >
      {/* <View className="flex justify-center items-center mb-10 rounded-full">
        <Image
          source={require("../../assets/icon.png")}
          className="w-12 h-12"
        />
      </View> */}

      <Text className="font-sans text-base text-white text-center mb-10">
        {message}
      </Text>
      <Button
        className="rounded flex items-center justify-center"
        onPress={clickAction}
        fullWidth
        title={clickText}
      />
      <Button
        className="rounded flex items-center justify-center"
        onPress={dismissAction}
        fullWidth
        variant="ghost"
        title="Dismiss"
      />
    </View>
  );
};
