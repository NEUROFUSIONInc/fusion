import React from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { ChevronDown, Help } from "../../icons";

export const InsightsHeader = () => {
  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <View className="flex flex-row">
        <Text className="font-sans-bold text-[26px] text-white">Monthly</Text>
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<ChevronDown />}
          onPress={() => console.log("handle dropdown")}
        />
      </View>

      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Help />}
        onPress={() => console.log("handle help")}
      />
    </View>
  );
};
