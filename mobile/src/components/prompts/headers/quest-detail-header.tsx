import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, Text, View } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

import { AccountContext } from "~/contexts";
import { useDeleteQuest } from "~/hooks";
import { handleSendFeeback } from "~/services";

export const QuestDetailHeader = () => {
  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);
  const { mutate: deleteQuest } = useDeleteQuest();

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
            // confirm delete
            Alert.alert(
              "Leave Quest",
              "Are you sure you want to leave this quest? This action cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteQuest(
                        accountContext?.userPreferences?.activeQuestGuid!
                      );
                      navigation.goBack();
                    } catch (error) {
                      console.error("Failed to leave quest", error);
                    }
                  },
                },
              ]
            );
          }
        }}
      >
        <Button variant="ghost" size="icon" leftIcon={<VerticalMenu />} />
      </ContextMenu>
    </View>
  );
};
