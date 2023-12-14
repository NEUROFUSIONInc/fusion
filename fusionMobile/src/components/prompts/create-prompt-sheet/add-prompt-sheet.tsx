import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useCallback, useRef, FC, RefObject } from "react";
import { View } from "react-native";

import { BottomSheet } from "../../bottom-sheet/bottom-sheet";
import { Button } from "../../button";
import { CreatePromptSheet } from "../create-prompt-sheet/create-prompt-sheet";
import { PromptOption } from "../prompt-option/prompt-option";

interface AddPromptSheetProps {
  bottomSheetRef: RefObject<RNBottomSheet>;
  selectedCategory?: string;
}

export const AddPromptSheet: FC<AddPromptSheetProps> = ({ bottomSheetRef }) => {
  const createPromptSheetRef = useRef<RNBottomSheet>(null);

  const handleBottomSheetClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleCreatePromptSheetOpen = useCallback(() => {
    bottomSheetRef.current?.close();
    createPromptSheetRef.current?.expand();
  }, []);

  return (
    <Portal>
      <BottomSheet ref={bottomSheetRef} snapPoints={["42.5%"]}>
        <View className="flex flex-1 w-full justify-center gap-y-10 flex-col p-5">
          <View className="flex flex-col gap-y-2.5 items-center">
            <PromptOption
              text="Add a prompt manually"
              onPress={handleCreatePromptSheetOpen}
            />
          </View>
          <Button title="Close" fullWidth onPress={handleBottomSheetClose} />
        </View>
      </BottomSheet>

      <CreatePromptSheet promptSheetRef={createPromptSheetRef} />
    </Portal>
  );
};
