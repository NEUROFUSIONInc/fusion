import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";

import { Button } from "../../button";
import { LeftArrow, Pencil } from "../../icons";
import { CreatePromptSheet } from "../create-prompt-sheet";

export const QuickAddPromptsHeader = () => {
  const navigation = useNavigation();

  const createPromptSheetRef = useRef<RNBottomSheet>(null);

  const handleGoBack = () => {
    navigation.navigate("PromptNavigator", {
      screen: "Prompts",
    });
  };

  const handleExpandSheet = useCallback(
    () => createPromptSheetRef.current?.expand(),
    []
  );

  return (
    <View className="flex flex-row p-3 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow width={25} height={25} />}
        onPress={handleGoBack}
      />

      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Pencil width={25} height={25} />}
        onPress={handleExpandSheet}
      />

      <Portal>
        <CreatePromptSheet promptSheetRef={createPromptSheetRef} />
      </Portal>
    </View>
  );
};
