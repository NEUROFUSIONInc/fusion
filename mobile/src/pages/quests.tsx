import RNBottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import { Text, View, Image, Pressable } from "react-native";

import {
  Button,
  Plus,
  Screen,
  JoinQuestSheet,
  VerticalMenu,
} from "~/components";
import { AccountContext } from "~/contexts";
import { useQuestsQuery } from "~/hooks";
import { colors } from "~/theme";

export function QuestsScreen() {
  const bottomSheetRef = React.useRef<RNBottomSheet>(null);
  const handleExpandSheet = React.useCallback(
    () => bottomSheetRef.current?.expand(),
    []
  );
  const accountContext = useContext(AccountContext);

  const navigation = useNavigation();

  const { data: activeQuests, isLoading } = useQuestsQuery();

  return (
    <Screen>
      {activeQuests?.length === 0 && (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image
            source={require("../../assets/group-investigation.png")}
            className="w-32 h-32"
          />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Share changes in your health and behavior with others. Join research
            studies.
          </Text>
          <Button
            title="Join a Quest"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={handleExpandSheet}
            className="self-center"
          />
        </View>
      )}

      {/* TODO: Display a list of quests the user is subscribed to */}
      {!isLoading && activeQuests && activeQuests.length > 0 && (
        <Text className="mt-5 mb-3 pl-3 font-sans-bold text-base text-white">
          My quests
        </Text>
      )}

      {!isLoading &&
        activeQuests?.map((quest) => (
          <Pressable
            key={quest.guid}
            className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900 active:opacity-90 my-1"
            onPress={() => {
              navigation.navigate("QuestNavigator", {
                screen: "QuestDetailScreen",
                params: {
                  quest,
                },
              });
            }}
          >
            <View className="flex-1 flex-col items-start gap-y-3">
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="font-sans flex flex-wrap text-white text-base mr-2"
              >
                {quest.title}
              </Text>
            </View>
            <Button
              variant="ghost"
              className="m-0 p-0 self-center"
              leftIcon={<VerticalMenu />}
              onPress={() => {}}
            />
          </Pressable>
        ))}

      <JoinQuestSheet bottomSheetRef={bottomSheetRef} />
    </Screen>
  );
}
