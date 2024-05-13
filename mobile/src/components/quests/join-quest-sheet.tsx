import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { FC, RefObject, useContext, useState } from "react";
import {
  View,
  Pressable,
  Text,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { black } from "tailwindcss/colors";

import { BottomSheet } from "../bottom-sheet/bottom-sheet";
import { Button } from "../button";
import { ChevronRight } from "../icons";
import { Input } from "../input";

import { Prompt } from "~/@types";
import { IS_IOS } from "~/config";
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
      console.log(fusionBackendUrl);
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
        Keyboard.dismiss();
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
        Alert.alert(err.response.data.message || "Quest not found");
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

  const [sheetHeight, setSheetHeight] = useState(["45%"]);

  return (
    <Portal>
      <BottomSheet ref={bottomSheetRef} snapPoints={sheetHeight}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={IS_IOS ? 130 : 0}
          // className="h-full bg-dark"
          className="flex flex-1 w-full h-full justify-center gap-y-10 flex-col p-5"
        >
          <View className="flex flex-col gap-y-2.5">
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              {/* add input ask user to enter code */}
              <Input
                value={joinCode}
                onChangeText={setJoinCode}
                label="Quests are currently invite only. Your organizer will send you one."
                className="mb-5"
                placeholder="Enter join code"
                onTouchStart={() => {
                  console.log("input pressed");
                  setSheetHeight(["100%"]);
                }}
                onEndEditing={() => {
                  console.log("input blur");
                  setSheetHeight(["45%"]);
                  Keyboard.dismiss();
                }}
              />
            </TouchableWithoutFeedback>

            <Button
              title="Join Quest"
              rightIcon={<ChevronRight color={black} />}
              fullWidth
              className="flex flex-row justify-between"
              disabled={joinCode === ""}
              onPress={handleJoinQuest}
            />
            <Pressable onPress={_handlePressButtonAsync}>
              <Text className="font-sans text-white underline">
                Don't have a code?
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Portal>
  );
};
