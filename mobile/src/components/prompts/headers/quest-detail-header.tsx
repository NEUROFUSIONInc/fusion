import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

export const QuestDetailHeader = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow width={32} height={32} />}
        onPress={handleGoBack}
      />
      <Text className="font-sans text-base text-white">Quest</Text>
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<VerticalMenu />}
        onPress={() => {}}
      />
    </View>
  );
};
