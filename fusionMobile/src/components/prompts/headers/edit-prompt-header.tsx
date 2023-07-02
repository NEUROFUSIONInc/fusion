import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";
import { PromptOptionsSheet } from "../prompt-details/sheets";

import { RouteProp } from "~/navigation";

export const EditPromptHeader = () => {
  const route = useRoute<RouteProp<"EditPrompt">>();
  const promptOptionsSheet = useRef<RNBottomSheet>(null);
  const navigation = useNavigation();
  const isEdit = route.params.type === "edit";

  const handleBottomSheetClose = useCallback(() => {
    promptOptionsSheet.current?.close();
  }, []);

  const handlePromptOptionsSheetOpen = useCallback(() => {
    promptOptionsSheet.current?.expand();
  }, []);

  const handleGoBack = () => {
    handleBottomSheetClose();
    navigation.goBack();
  };

  const renderPortal = () => {
    return (
      <Portal>
        <PromptOptionsSheet
          promptOptionsSheetRef={promptOptionsSheet}
          promptId={isEdit ? route.params.promptId : ""}
          onBottomSheetClose={handleBottomSheetClose}
          showLimitedOptions
        />
      </Portal>
    );
  };

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow width={32} height={32} />}
        onPress={handleGoBack}
      />
      <Text className="font-sans text-base text-white">
        {isEdit ? "Edit prompt" : "Quick add prompts"}
      </Text>
      {isEdit ? (
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<VerticalMenu />}
          onPress={handlePromptOptionsSheetOpen}
        />
      ) : (
        <View />
      )}

      {isEdit && renderPortal()}
    </View>
  );
};
