import { FontAwesome5 } from "@expo/vector-icons";
import RNBottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { FC, RefObject, useCallback } from "react";
import { Alert, View } from "react-native";

import { BottomSheet } from "../../../bottom-sheet";
import { Notebook, Pause, Pencil, Trash } from "../../../icons";
import { PromptOption } from "../../prompt-option";

import { Prompt } from "~/@types";
import { Button } from "~/components/button";
import { usePrompts } from "~/hooks";
import { PromptScreenNavigationProp } from "~/navigation";
import { promptService } from "~/services";
import { appInsights, maskPromptId } from "~/utils";

interface PromptOptionsSheetProps {
  promptOptionsSheetRef: RefObject<RNBottomSheet>;
  onBottomSheetClose: () => void;
  activePrompt?: Prompt;
}

export const PromptOptionsSheet: FC<PromptOptionsSheetProps> = ({
  activePrompt,
  promptOptionsSheetRef,
  onBottomSheetClose,
}) => {
  const { setSavedPrompts } = usePrompts();
  const navigation = useNavigation<PromptScreenNavigationProp>();

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
                onBottomSheetClose?.();
              }
            },
          },
        ]
      );
    }
  }, [activePrompt]);

  const handlePromptNotificationStateUpdate = useCallback(async () => {
    if (activePrompt) {
      const promptUpdateLabel =
        activePrompt.additionalMeta?.isNotificationActive === false
          ? "Resume Prompt"
          : "Pause Prompt";
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
              activePrompt.additionalMeta?.isNotificationActive === false
                ? true
                : false
            );

            if (res) {
              const savedPrompts = await promptService.readSavedPrompts();
              if (savedPrompts) {
                setSavedPrompts(savedPrompts);
              }
              onBottomSheetClose();
            }
          },
        },
      ]);
    }
  }, [activePrompt]);

  const promptOptions = [
    {
      option: "Log Prompt",
      icon: <Notebook />,
      onPress: () => {
        onBottomSheetClose?.();
        activePrompt &&
          navigation.navigate("PromptEntry", {
            promptUuid: activePrompt?.uuid,
            triggerTimestamp: Math.floor(dayjs().unix()),
          });
      },
    },
    {
      option: "Edit Prompt",
      icon: <Pencil />,
      onPress: () => {
        onBottomSheetClose?.();
        navigation.navigate("AuthorPrompt", {
          prompt: activePrompt,
        });
      },
    },
    {
      option: "View History",
      icon: <FontAwesome5 name="history" size={18} color="white" />,
      onPress: () => {
        onBottomSheetClose?.();
        activePrompt &&
          navigation.navigate("ViewResponses", {
            prompt: activePrompt,
          });
      },
    },
    {
      option:
        activePrompt?.additionalMeta?.isNotificationActive === false
          ? "Resume Prompt"
          : "Pause Prompt",
      icon:
        activePrompt?.additionalMeta?.isNotificationActive === false ? (
          <FontAwesome5 name="play" size={18} color="white" />
        ) : (
          <Pause />
        ),
      onPress: handlePromptNotificationStateUpdate,
    },
    {
      option: "Delete Prompt",
      icon: <Trash />,
      onPress: handlePromptDelete,
    },
    // {
    //   option: "Share prompt",
    //   icon: <Location />,
    // },
  ];

  return (
    <BottomSheet
      ref={promptOptionsSheetRef}
      snapPoints={["65%"]}
      onClose={onBottomSheetClose}
    >
      <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
        <View className="flex flex-col gap-y-2.5 items-center">
          {promptOptions.map((option, index) => (
            <PromptOption
              key={index}
              icon={option.icon}
              text={option.option}
              onPress={option.onPress}
            />
          ))}
        </View>

        <Button title="Close" fullWidth onPress={onBottomSheetClose} />
      </View>
    </BottomSheet>
  );
};
