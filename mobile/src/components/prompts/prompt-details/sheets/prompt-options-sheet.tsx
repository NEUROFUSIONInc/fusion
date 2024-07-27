import { FontAwesome5 } from "@expo/vector-icons";
import RNBottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { FC, RefObject, useCallback, useContext, useMemo } from "react";
import { Alert, View } from "react-native";

import { BottomSheet } from "../../../bottom-sheet";
import { Notebook, Pause, Pencil, Trash } from "../../../icons";
import { PromptOption } from "../../prompt-option";

import { Prompt } from "~/@types";
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
  showLimitedOptions?: boolean;
  allowEdit?: boolean;
}

enum PromptOptionKey {
  record = "record",
  previous = "previous",
  edit = "edit",
  notification = "notification",
  delete = "delete",
  share = "share",
}

interface PromptOption {
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
  showLimitedOptions = false,
  allowEdit = true,
}) => {
  const { data: activePrompt } = usePrompt(promptId, defaultPrompt);
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const insightsNavigator = useNavigation<any>();
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);
  const { mutateAsync: deletePrompt } = useDeletePrompt();
  const { mutateAsync: updatePromptNotificationState } =
    useUpdatePromptNotificationState(activePrompt?.uuid!);

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

  const promptOptions: PromptOption[] = [
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
      option: "Previous Responses",
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

  // Limited options: Delete Prompt,  Share Prompt

  const limitedOptions = promptOptions.slice(4, 5);
  const optionsToShow = useMemo(() => {
    const options = showLimitedOptions ? limitedOptions : promptOptions;
    return !allowEdit
      ? options.filter((option) => option.key !== PromptOptionKey.edit)
      : options;
  }, [showLimitedOptions]);

  return (
    <BottomSheet
      ref={promptOptionsSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      onClose={onBottomSheetClose}
    >
      <View
        className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5"
        onLayout={handleContentLayout}
      >
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
