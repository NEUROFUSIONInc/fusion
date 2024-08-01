import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

import { handleSendFeeback } from "~/services";

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

      <ContextMenu
        title="Options"
        dropdownMenuMode
        actions={[
          { title: "Feedback" },
          { title: "Leave Quest", destructive: true },
        ]}
        onPress={(e) => {
          if (e.nativeEvent.index === 0) {
            return handleSendFeeback("");
          } else if (e.nativeEvent.index === 1) {
          }
        }}
      >
        <Button variant="ghost" size="icon" leftIcon={<VerticalMenu />} />
      </ContextMenu>
    </View>
  );
};
