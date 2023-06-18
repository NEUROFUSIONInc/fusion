import React, { FC, useCallback, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";

import { BottomSheet } from "../../bottom-sheet";
import { Button } from "../../button";
import { VerticalMenu } from "../../icons";
import { PromptOption } from "../prompt-option";

import { NotificationConfigDays, Prompt } from "~/@types";
import {
  appInsights,
  getFrequencyLabel,
  interpretDaySelection,
  maskPromptId,
} from "~/utils";
import dayjs from "dayjs";
import { promptService } from "~/services";
import { usePrompts } from "~/hooks";

interface PromptDetailsProps {
  prompt: Prompt;
}

export const PromptDetails: FC<PromptDetailsProps> = ({ prompt }) => {
  const days = JSON.parse(
    prompt.notificationConfig_days
  ) as NotificationConfigDays;

  const bottomSheetRef = useRef<RNBottomSheet>(null);

  const navigation = useNavigation();

  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const { setSavedPrompts } = usePrompts();

  const handleExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
    bottomSheetRef.current?.expand();
  }, []);

  const handleBottomSheetClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handlePromptDelete = useCallback(async () => {
    if (activePrompt) {
      Alert.alert(
        "Delete Prompt",
        "Are you sure you want to delete this prompt?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              const res = await promptService.deletePrompt(activePrompt.uuid);
              if (res) {
                appInsights.trackEvent(
                  { name: "prompt_deleted" },
                  {
                    identifier: await maskPromptId(activePrompt.uuid),
                  }
                );

                setSavedPrompts(res);
                handleBottomSheetClose();
              }
            },
          },
        ]
      );
    }
  }, []);

  return (
    <View className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900">
      <View className="flex-1 flex-col items-start gap-y-3">
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="font-sans flex flex-wrap text-white text-base"
        >
          {prompt.promptText}
        </Text>
        <View className="flex flex-row gap-x-2 items-center">
          <Text className="font-sans text-sm text-white opacity-60">
            {interpretDaySelection(days)}
          </Text>
          <View className="w-1 h-1 bg-white opacity-60" />
          <Text className="font-sans text-sm text-white opacity-60">
            {getFrequencyLabel(
              prompt.notificationConfig_startTime,
              prompt.notificationConfig_endTime,
              prompt.notificationConfig_countPerDay
            )}
          </Text>
        </View>
      </View>
      <Button
        variant="ghost"
        className="m-0 p-0 self-center"
        leftIcon={<VerticalMenu />}
        onPress={() => handleExpandSheet(prompt)}
      />

      <Portal>
        <BottomSheet ref={bottomSheetRef} snapPoints={["55%"]}>
          {activePrompt && (
            <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
              <View className="flex flex-col gap-y-2.5 items-center">
                <PromptOption
                  text="Log"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("PromptEntry", {
                      promptUuid: activePrompt.uuid,
                      triggerTimestamp: Math.floor(dayjs().unix()),
                    });
                  }}
                />
                <PromptOption
                  text="History"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("ViewResponses", {
                      prompt: activePrompt,
                    });
                  }}
                />
                <PromptOption
                  text="Edit"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("AuthorPrompt", {
                      prompt: activePrompt,
                    });
                  }}
                />
                <PromptOption text="Delete" onPress={handlePromptDelete} />
              </View>
              <Button
                title="Close"
                fullWidth
                onPress={handleBottomSheetClose}
              />
            </View>
          )}
        </BottomSheet>
      </Portal>
    </View>
  );
};
