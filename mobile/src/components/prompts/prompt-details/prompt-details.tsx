import React, { FC } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "../../button";
import { VerticalMenu } from "../../icons";

import { Prompt } from "~/@types";
import { convertTime, getFrequencyLabel, interpretDaySelection } from "~/utils";

interface PromptDetailsProps {
  variant?: "detail" | "add";
  prompt: Prompt;
  displayFrequency?: boolean;
  onClick?: () => void;
}

export const PromptDetails: FC<PromptDetailsProps> = ({
  variant = "detail",
  prompt,
  displayFrequency = true,
  onClick,
}) => {
  const days = prompt.notificationConfig_days;

  const frequencyLabel = getFrequencyLabel(
    prompt.notificationConfig_startTime,
    prompt.notificationConfig_endTime,
    prompt.notificationConfig_countPerDay
  );

  return (
    <Pressable
      className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900 active:opacity-90"
      onPress={onClick}
    >
      <View className="flex-1 flex-col items-start gap-y-3">
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="font-sans flex flex-wrap text-white text-base"
        >
          {prompt.promptText}
        </Text>
        {displayFrequency &&
          (prompt.additionalMeta?.isNotificationActive === false ? (
            <View className="flex flex-row items-center">
              <Text className="font-sans text-sm text-white opacity-60">
                Paused
              </Text>
            </View>
          ) : (
            <View className="flex flex-row gap-x-2 items-center">
              <Text className="font-sans text-sm text-white opacity-60">
                {interpretDaySelection(days)}
              </Text>
              <View className="flex flex-row items-center">
                <View className="w-1 h-1 bg-white opacity-60" />
                {frequencyLabel === "Once" ? (
                  <Text className="font-sans text-sm text-white opacity-60 pl-2">
                    {frequencyLabel +
                      " at " +
                      convertTime(prompt.notificationConfig_startTime)}
                  </Text>
                ) : (
                  <Text className="font-sans text-sm text-white opacity-60 pl-2 over">
                    {frequencyLabel +
                      " from " +
                      convertTime(prompt.notificationConfig_startTime)}
                  </Text>
                )}
              </View>
            </View>
          ))}
      </View>
      {variant === "add" ? (
        <Button
          title="Add"
          className="m-0 px-4 py-2 self-center"
          rounded
          onPress={onClick}
        />
      ) : (
        <Button
          variant="ghost"
          className="m-0 p-0 self-center"
          leftIcon={<VerticalMenu />}
          onPress={onClick}
        />
      )}
    </Pressable>
  );
};
