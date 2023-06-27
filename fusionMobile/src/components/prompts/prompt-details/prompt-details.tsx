import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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
  const days = prompt.notificationConfig_days;
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
  }, [activePrompt]);

  const [promptUpdateLabel, setPromptUpdateLabel] = useState("");
  const [activePromptNotificationState, setActivePromptNotificationState] =
    useState(false);

  const handlePromptNotificationStateUpdate = useCallback(async () => {
    if (activePrompt) {
      Alert.alert(promptUpdateLabel, "Are you sure?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            // check if promptNotification is active
            const res = await promptService.updatePromptNotificationState(
              activePrompt.uuid,
              !activePromptNotificationState
            );

            if (res) {
              const savedPrompts = await promptService.readSavedPrompts();
              if (savedPrompts) {
                setSavedPrompts(savedPrompts);
              }
              handleBottomSheetClose();
            }
          },
        },
      ]);
    }
  }, [activePrompt, activePromptNotificationState]);

  useEffect(() => {
    // check if promptNotification is active
    if (activePrompt) {
      let label = "";
      let notificationState = true;
      if (prompt.additionalMeta) {
        const additionalMeta = prompt.additionalMeta;
        if (additionalMeta["isNotificationActive"]) {
          label = "Pause Prompt";
          notificationState = true;
        } else {
          label = "Resume Prompt";
          notificationState = false;
        }
      } else {
        // this means it hasn't been set so we assume it's active
        label = "Pause Prompt";
      }

      setPromptUpdateLabel(label);
      setActivePromptNotificationState(notificationState);
    }
  }, [activePrompt]);

  return (
    <Pressable
      className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900"
      onPress={() => handleExpandSheet(prompt)}
    >
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

          {prompt.additionalMeta.isNotificationActive === false && (
            <View className="flex flex-row items-center">
              <View className="w-1 h-1 bg-white opacity-60" />
              <Text className="font-sans text-sm text-white opacity-60 pl-2">
                Paused
              </Text>
            </View>
          )}
          {/* <Text className="font-sans text-sm text-white opacity-60">
            // results from this function are not consistent
            {getFrequencyLabel(
              prompt.notificationConfig_startTime,
              prompt.notificationConfig_endTime,
              prompt.notificationConfig_countPerDay
            )}
          </Text> */}
        </View>
      </View>
      <Button
        variant="ghost"
        className="m-0 p-0 self-center"
        leftIcon={<VerticalMenu />}
      />

      <Portal>
        <BottomSheet ref={bottomSheetRef} snapPoints={["62%"]}>
          {activePrompt && (
            <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
              <View className="flex flex-col gap-y-2.5 items-center">
                <PromptOption
                  text="Log Prompt"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("PromptEntry", {
                      promptUuid: activePrompt.uuid,
                      triggerTimestamp: Math.floor(dayjs().unix()),
                    });
                  }}
                />
                <PromptOption
                  text="View History"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("ViewResponses", {
                      prompt: activePrompt,
                    });
                  }}
                />
                <PromptOption
                  text="Edit Prompt"
                  onPress={() => {
                    handleBottomSheetClose();

                    navigation.navigate("AuthorPrompt", {
                      prompt: activePrompt,
                    });
                  }}
                />
                {/* conditional display based on state */}
                <PromptOption
                  text={promptUpdateLabel}
                  onPress={handlePromptNotificationStateUpdate}
                />
                <PromptOption
                  text="Delete Prompt"
                  onPress={handlePromptDelete}
                />
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
    </Pressable>
  );
};
