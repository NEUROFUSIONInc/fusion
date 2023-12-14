import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { Plus } from "../../icons";

export const PromptsHeader = () => {
  const navigation = useNavigation();

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Text className="font-sans-bold text-[26px] text-white">Prompts</Text>
      <Button
        variant="ghost"
        size="icon"
        rounded
        className="bg-white/10"
        leftIcon={<Plus />}
        onPress={() => {
          navigation.navigate("QuickAddPrompts");
        }}
      />
    </View>
  );
};
