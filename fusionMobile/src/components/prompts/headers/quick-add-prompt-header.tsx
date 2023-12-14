import RNBottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";
import { AddPromptSheet } from "../create-prompt-sheet/add-prompt-sheet";

export const QuickAddPromptsHeader = () => {
  const navigation = useNavigation();

  const bottomSheetRef = useRef<RNBottomSheet>(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleExpandSheet = useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

  return (
    <View className="flex flex-row p-3 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow width={32} height={32} />}
        onPress={handleGoBack}
      />
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<VerticalMenu />}
        onPress={handleExpandSheet}
      />

      <AddPromptSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};
