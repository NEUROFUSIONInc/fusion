import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";
import { PromptOptionsSheet } from "../prompt-details/sheets";

import { Prompt, PromptOptionKey } from "~/@types";
import { RouteProp } from "~/navigation";
import { promptService } from "~/services";

export const EditPromptHeader = () => {
  const route = useRoute<RouteProp<"EditPrompt">>();
  const promptOptionsSheet = useRef<RNBottomSheet>(null);
  const navigation = useNavigation();
  const isEdit = route.params.type === "edit";

  const [prompt, setPrompt] = useState<Prompt>();
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const res = await promptService.getPrompt(
        route.params.type === "edit" ? route.params.promptId : ""
      );
      if (res) {
        setPrompt(res);
      }
    })();
  }, [isEdit, route.params]);

  const handleBottomSheetClose = useCallback(() => {
    promptOptionsSheet.current?.close();
  }, []);

  const handlePromptOptionsSheetOpen = useCallback(() => {
    setShowPromptOptionsSheet(true);
    promptOptionsSheet.current?.expand();
  }, []);

  const [showPromptOptionsSheet, setShowPromptOptionsSheet] = useState(false);

  const handleGoBack = () => {
    handleBottomSheetClose();
    navigation.navigate("Prompts");
  };

  const shouldShowOptions = isEdit && prompt && !prompt.additionalMeta.questId;

  return (
    <>
      <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<LeftArrow width={32} height={32} />}
          onPress={handleGoBack}
        />
        <Text className="font-sans text-base text-white">
          {isEdit ? "Edit Prompt" : "Add Prompt "}
        </Text>
        {shouldShowOptions ? (
          <Button
            variant="ghost"
            size="icon"
            leftIcon={<VerticalMenu />}
            onPress={handlePromptOptionsSheetOpen}
          />
        ) : (
          <View />
        )}
      </View>

      {shouldShowOptions && showPromptOptionsSheet && (
        <Portal>
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheet}
            promptId={route.params.promptId}
            onBottomSheetClose={handleBottomSheetClose}
            optionsList={[PromptOptionKey.delete]}
          />
        </Portal>
      )}
    </>
  );
};
