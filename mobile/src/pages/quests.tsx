import RNBottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { Text, View, Image } from "react-native";

import { Button, Plus, Screen, JoinQuestSheet } from "~/components";
import { colors } from "~/theme";

export function QuestsScreen() {
  const bottomSheetRef = React.useRef<RNBottomSheet>(null);
  const handleExpandSheet = React.useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );

  return (
    <Screen>
      <View className="flex flex-1 flex-col gap-7 items-center justify-center">
        <Image source={require("../../assets/pie-chart.png")} />
        <Text className="font-sans-light max-w-xs text-center text-white text-base">
          Perform activites in groups and validate their impact on your
          wellness!
        </Text>
        <Button
          title="Join a Quest"
          leftIcon={<Plus color={colors.dark} width={16} height={16} />}
          onPress={handleExpandSheet}
          className="self-center"
        />
      </View>

      {/* TODO: Display a list of quests the user is subscribed to */}

      <JoinQuestSheet bottomSheetRef={bottomSheetRef} />
    </Screen>
  );
}
