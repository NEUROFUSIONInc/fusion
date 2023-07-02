import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { Text, View } from "react-native";

import { BottomSheet } from "../../bottom-sheet";
import { Button } from "../../button";
import { Plus } from "../../icons";
import { CreatePromptSheet } from "../create-prompt-sheet";
import { PromptOption } from "../prompt-option";

import { PromptScreenNavigationProp } from "~/navigation";

export const PromptsHeader = () => {
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  const createPromptSheetRef = useRef<RNBottomSheet>(null);
  const navigation = useNavigation<PromptScreenNavigationProp>();

  const handleExpandSheet = useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

  const handleBottomSheetClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleCreatePromptSheetOpen = useCallback(() => {
    bottomSheetRef.current?.close();
    createPromptSheetRef.current?.expand();
  }, []);

  const handleQuickAddPrompt = useCallback(() => {
    bottomSheetRef.current?.close();
    navigation.navigate("QuickAddPrompts");
  }, []);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Text className="font-sans-bold text-[26px] text-white">Prompts</Text>
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Plus />}
        onPress={handleExpandSheet}
      />
      <Portal>
        <BottomSheet ref={bottomSheetRef} snapPoints={["42.5%"]}>
          <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
            <View className="flex flex-col gap-y-2.5 items-center">
              <PromptOption
                text="Quick add prompt"
                onPress={handleQuickAddPrompt}
              />
              <PromptOption
                text="Create new prompt"
                onPress={handleCreatePromptSheetOpen}
              />
            </View>
            <Button title="Close" fullWidth onPress={handleBottomSheetClose} />
          </View>
        </BottomSheet>
      </Portal>

      <Portal>
        <CreatePromptSheet promptSheetRef={createPromptSheetRef} />
      </Portal>
    </View>
  );
};
