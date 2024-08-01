import RNBottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";

import { Plus } from "~/components/icons";
import { JoinQuestSheet } from "~/components/quests";

export const QuestsHeader = () => {
  const bottomSheetRef = React.useRef<RNBottomSheet>(null);
  const handleExpandSheet = React.useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );
  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Text className="font-sans-bold text-[26px] text-white">Quests</Text>

      <View className="flex flex-row">
        <Button
          variant="ghost"
          size="icon"
          rounded
          className="bg-white/10"
          leftIcon={
            <View className="pl-1">
              <Plus height={20} width={20} />
            </View>
          }
          onPress={handleExpandSheet}
        />
      </View>
      <JoinQuestSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};
