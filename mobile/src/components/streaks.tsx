import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import dayjs from "dayjs";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { View, Text } from "react-native";

import { BottomSheet } from "./bottom-sheet";
import { Button } from "./button";
import { Streak } from "./icons";

import { Prompt } from "~/@types";
import { AccountContext } from "~/contexts";
import { promptService, streakService } from "~/services";

export const Streaks: FC = () => {
  const accountContext = useContext(AccountContext);
  const streakSheetRef = useRef<RNBottomSheet>(null);

  const handleStreakSheetOpen = useCallback(() => {
    streakSheetRef.current?.expand();
  }, []);

  const [streakScore, setStreakScore] = useState(0);
  const [activePrompts, setActivePrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    (async () => {
      const res = await promptService.getActivePromptsToday();
      if (res) {
        setActivePrompts(res);
      }

      // get streak value
      const streakScoreResponse = await streakService.getStreakScore(
        dayjs().startOf("day").valueOf()
      );
      if (streakScoreResponse) {
        setStreakScore(streakScoreResponse.score);
      }
    })();
  }, []);

  // get total responses for active prompts
  const [responsesForActivePrompts, setResponsesForActivePrompts] = useState(0);
  useEffect(() => {
    if (activePrompts.length < 1) return;
    (async () => {
      // get prompt responses for today, filter by count
      const promptIds = activePrompts.map((p) => p.uuid);
      console.log("promptIds", promptIds);
      const res = await promptService.getPromptResponsesFromPromptIds(
        promptIds,
        dayjs().startOf("day").valueOf()
      );
      if (res) {
        const uniquePrompts = new Set(res.map((r) => r.promptUuid));
        setResponsesForActivePrompts(uniquePrompts.size);
      }
    })();
  }, [activePrompts]);

  return (
    <View className="mr-3">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Streak />}
        onPress={handleStreakSheetOpen}
        title={streakScore.toString()}
      />

      <Portal>
        <BottomSheet ref={streakSheetRef} snapPoints={["42.5%"]}>
          <View className="flex flex-1 w-full justify-between flex-col p-5 items-center mb-10">
            <Text className="text-white text-lg font-sans-bold text-center">
              Build your streaks for {"\n"} better{" "}
              {accountContext?.userPreferences.lastActiveCategory} Insights
            </Text>
            <View>
              <View className="flex flex-row justify-around self-center">
                <Streak />
                <Text className="text-white text-base font-sans ml-1">
                  {streakScore}
                </Text>
              </View>
              <Text className="text-white text-base font-sans">
                Fusion Streak
              </Text>
            </View>
            {activePrompts.length > 0 &&
            activePrompts.length === responsesForActivePrompts ? (
              <Text className="text-white text-base font-sans text-center">
                You've responded to all prompts for today and earned a streak.
                Keep it up 🎉
              </Text>
            ) : (
              <Text className="text-white text-base font-sans text-center">
                You've responded to {responsesForActivePrompts} out of{" "}
                {activePrompts.length} prompts today. Keep it up 🎉
              </Text>
            )}

            {/* TODO: If you don't have a prompt active for today, that's okay you don't lose it, you just get any... */}
            {responsesForActivePrompts < 1 ? (
              <Text className="text-white text-base font-sans text-center">
                Respond to at least one prompt today to earn a Fusion streak!
              </Text>
            ) : null}
          </View>
        </BottomSheet>
      </Portal>
    </View>
  );
};
