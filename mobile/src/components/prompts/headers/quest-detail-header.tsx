import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View, Alert } from "react-native";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

export const QuestDetailHeader = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    // TODO: send the user back to the quest list page
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
        onPress={() => {
          // show button to delete leave & delete quest
          Alert.alert(
            "Quest Options",
            "What would you like to do with this quest?",
            [
              {
                text: "Leave Quest",
                onPress: () => {},
                style: "destructive",
              },
              {
                text: "Go back",
                style: "cancel",
              },
            ]
          );
        }}
      />
    </View>
  );
};
