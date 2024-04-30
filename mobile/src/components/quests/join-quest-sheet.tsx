import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { FC, RefObject, useContext, useState } from "react";
import { View, Pressable, Text, Alert } from "react-native";

import { BottomSheet } from "../bottom-sheet/bottom-sheet";
import { Input } from "../input";
import { PromptOption } from "../prompts/prompt-option/prompt-option";

import { Prompt } from "~/@types";
import { AccountContext } from "~/contexts";

interface AddPromptSheetProps {
  bottomSheetRef: RefObject<RNBottomSheet>;
  selectedCategory?: string;
}

export const JoinQuestSheet: FC<AddPromptSheetProps> = ({ bottomSheetRef }) => {
  const accountContext = useContext(AccountContext);
  const navigation = useNavigation();

  let fusionBackendUrl = "";
  if (Constants.expoConfig?.extra) {
    fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
  }

  const [joinCode, setJoinCode] = useState("");

  const handleJoinQuest = async () => {
    // call api to fetch the quest if it's still active
    try {
      const res = await axios.get(`${fusionBackendUrl}/api/quest/getByCode`, {
        params: {
          joinCode,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountContext?.userApiToken}`,
        },
      });

      if (res.data) {
        // navigate to quest screen
        const questRes = res.data.quest;
        console.log(questRes.config);
        const questPrompts = JSON.parse(questRes.config) as Prompt[];
        console.log("prompts object", questPrompts);
        // build the quest object and navigate to the quest screen
        bottomSheetRef.current?.close();
        navigation.navigate("QuestNavigator", {
          screen: "QuestDetailScreen",
          params: {
            quest: {
              title: questRes.title,
              description: questRes.description,
              guid: questRes.guid,
              prompts: questPrompts,
            },
          },
        });
      } else {
        Alert.alert("Quest not found");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        Alert.alert("Join code is invalid. Please confirm & retry");
      } else {
        Alert.alert("An error occurred. Please try again later");
      }
    }
  };

  const _handlePressButtonAsync = async () => {
    const result = await WebBrowser.openBrowserAsync(
      "https://usefusion.ai/blog"
    );
  };

  return (
    <Portal>
      <BottomSheet ref={bottomSheetRef} snapPoints={["42.5%"]}>
        <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
          <View className="flex flex-col gap-y-2.5">
            {/* add input ask user to enter code */}
            <Input
              value={joinCode}
              onChangeText={setJoinCode}
              label="Quests are currently invite only. Your organizer will send you one"
              className="mb-5"
              placeholder="Enter join code"
            />

            <PromptOption text="Join Quest" onPress={handleJoinQuest} />
            <Pressable onPress={_handlePressButtonAsync}>
              <Text className="font-sans text-white underline">
                Don't have a code?
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </Portal>
  );
};
