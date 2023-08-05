import RNBottomSheet from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { Plus } from "../../icons";
import { AddPromptSheet } from "../create-prompt-sheet/add-prompt-sheet";

export const PromptsHeader = () => {
  const bottomSheetRef = useRef<RNBottomSheet>(null);

  const handleExpandSheet = useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Text className="font-sans-bold text-[26px] text-white">Prompts</Text>
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Plus />}
        onPress={handleExpandSheet}
      />

      <AddPromptSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};
