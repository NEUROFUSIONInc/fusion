import { FontAwesome5 } from "@expo/vector-icons";
import RNBottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { FC, RefObject, useCallback, useContext, useMemo } from "react";
import { Alert, View } from "react-native";

import { BottomSheet } from "../../../bottom-sheet";
import { Notebook, Pause, Pencil, Trash } from "../../../icons";
import { PromptOption } from "../../prompt-option";

import { allPromptOptionKeys, Prompt, PromptOptionKey } from "~/@types";
import { Button } from "~/components/button";
import { AccountContext } from "~/contexts/account.context";
import {
  useDeletePrompt,
  usePrompt,
  useUpdatePromptNotificationState,
} from "~/hooks";
import { PromptScreenNavigationProp } from "~/navigation";
import { appInsights, maskPromptId } from "~/utils";

interface PromptOptionsSheetProps {
  promptOptionsSheetRef: RefObject<RNBottomSheet>;
  onBottomSheetClose: () => void;
  promptId: string;
  defaultPrompt?: Prompt;
  allowEdit?: boolean;
  optionsList?: PromptOptionKey[];
}

interface IPromptOption {
  key: PromptOptionKey;
  option: string;
  icon: React.ReactElement;
  onPress: () => void;
}

export const PromptOptionsSheet: FC<PromptOptionsSheetProps> = ({
  promptId,
  defaultPrompt,
  promptOptionsSheetRef,
  onBottomSheetClose,
  allowEdit = true,
  optionsList = allPromptOptionKeys,
}) => {
  const { data: activePrompt } = usePrompt(promptId, defaultPrompt);
  const { mutateAsync: deletePrompt } = useDeletePrompt();
  const { mutateAsync: updatePromptNotificationState } =
    useUpdatePromptNotificationState(activePrompt?.uuid!);
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const insightsNavigator = useNavigation<any>();

  const accountContext = useContext(AccountContext);

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
            text: "Delete",
            onPress: async () => {
              const res = await deletePrompt(activePrompt.uuid);
              if (res) {
                appInsights.trackEvent(
                  { name: "prompt_deleted" },
                  {
                    identifier: await maskPromptId(activePrompt.uuid),
                    userNpub: accountContext?.userNpub,
                  }
                );
                onBottomSheetClose();
                navigation.navigate("PromptNavigator", {
                  screen: "Prompts",
                });
              }
            },
            style: "destructive",
          },
        ]
      );
    }
  }, [activePrompt]);

  const handlePromptNotificationStateUpdate = async () => {
    if (activePrompt) {
      const promptUpdateLabel =
        activePrompt?.additionalMeta?.isNotificationActive === false
          ? "Enable Notifications"
          : "Pause Notifications";
      Alert.alert(promptUpdateLabel, "Are you sure?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            // check if promptNotification is active
            const res = await updatePromptNotificationState({
              promptUuid: activePrompt.uuid,
              isNotificationActive:
                activePrompt?.additionalMeta?.isNotificationActive === false,
            });

            if (res) {
              onBottomSheetClose();
            }
          },
        },
      ]);
    }
  };

  const promptOptions: IPromptOption[] = [
    {
      key: PromptOptionKey.record,
      option: "Record Response",
      icon: <Notebook />,
      onPress: () => {
        onBottomSheetClose();
        activePrompt &&
          navigation.navigate("PromptNavigator", {
            screen: "PromptEntry",
            params: {
              promptUuid: activePrompt?.uuid,
              triggerTimestamp: Math.floor(dayjs().unix()),
            },
          });
      },
    },
    {
      key: PromptOptionKey.previous,
      option: "View Previous Responses",
      icon: <FontAwesome5 name="history" size={18} color="white" />,
      onPress: () => {
        onBottomSheetClose?.();
        activePrompt &&
          insightsNavigator.navigate("InsightsNavigator", {
            screen: "InsightsPage",
            params: {
              promptUuid: activePrompt.uuid,
            },
          });
      },
    },
    {
      key: PromptOptionKey.edit,
      option: "Edit Prompt",
      icon: <Pencil />,
      onPress: () => {
        onBottomSheetClose();
        activePrompt &&
          navigation.navigate("PromptNavigator", {
            screen: "EditPrompt",
            params: {
              promptId: activePrompt?.uuid,
              type: "edit",
            },
          });
      },
    },
    {
      key: PromptOptionKey.notification,
      option:
        activePrompt?.additionalMeta?.isNotificationActive === false
          ? "Enable Notifications"
          : "Pause Notifications",
      icon:
        activePrompt?.additionalMeta?.isNotificationActive === false ? (
          <FontAwesome5 name="play" size={18} color="white" />
        ) : (
          <Pause />
        ),
      onPress: handlePromptNotificationStateUpdate,
    },
    {
      key: PromptOptionKey.delete,
      option: "Delete Prompt",
      icon: <Trash />,
      onPress: handlePromptDelete,
    },
    // {
    //   option: "Share prompt",
    //   icon: <Location />,
    // },
  ];

  const optionsToShow = useMemo(() => {
    const options = promptOptions.filter(
      (option) =>
        optionsList.includes(option.key) &&
        (allowEdit || option.key !== PromptOptionKey.edit)
    );
    return options;
  }, [optionsList, allowEdit]);

  return (
    <BottomSheet
      ref={promptOptionsSheetRef}
      snapPoints={["60%"]}
      index={0} // NOTE: must be set for android to work propoerly lol :(
      onClose={onBottomSheetClose}
    >
      <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
        <View className="flex flex-col gap-y-2.5 items-center">
          {optionsToShow.map((option, index) => (
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
