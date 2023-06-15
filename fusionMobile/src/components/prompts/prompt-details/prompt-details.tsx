import React, { FC } from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { VerticalMenu } from "../../icons";

import { NotificationConfigDays, Prompt } from "~/@types";
import { getFrequencyLabel, interpretDaySelection } from "~/utils";

interface PromptDetailsProps {
  prompt: Prompt;
}

export const PromptDetails: FC<PromptDetailsProps> = ({ prompt }) => {
  const days = JSON.parse(
    prompt.notificationConfig_days
  ) as NotificationConfigDays;

  return (
    <View className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900">
      <View className="flex-1 flex-col items-start gap-y-3">
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="font-sans flex flex-wrap text-white text-base"
        >
          {prompt.promptText}
        </Text>
        <View className="flex flex-row gap-x-2 items-center">
          <Text className="font-sans text-sm text-white opacity-60">
            {interpretDaySelection(days)}
          </Text>
          <View className="w-1 h-1 bg-white opacity-60" />
          <Text className="font-sans text-sm text-white opacity-60">
            {getFrequencyLabel(
              prompt.notificationConfig_startTime,
              prompt.notificationConfig_endTime,
              prompt.notificationConfig_countPerDay
            )}
          </Text>
        </View>
      </View>
      <Button
        variant="ghost"
        className="m-0 p-0 self-center"
        leftIcon={<VerticalMenu />}
      />
    </View>
  );
};
