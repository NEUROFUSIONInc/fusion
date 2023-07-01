import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "../../button";
import { VerticalMenu } from "../../icons";

import { Prompt } from "~/@types";
import { interpretDaySelection } from "~/utils";

interface PromptDetailsProps {
  prompt: Prompt;
  onClick?: () => void;
}

export const PromptDetails: FC<PromptDetailsProps> = ({ prompt, onClick }) => {
  const days = prompt.notificationConfig_days;

  return (
    <Pressable
      className="flex flex-row w-full items-center justify-between rounded-md py-5 px-4 bg-secondary-900 active:opacity-90"
      onPress={onClick}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
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

          {prompt.additionalMeta?.isNotificationActive === false && (
            <View className="flex flex-row items-center">
              <View className="w-1 h-1 bg-white opacity-60" />
              <Text className="font-sans text-sm text-white opacity-60 pl-2">
                Paused
              </Text>
            </View>
          )}
          {/* <Text className="font-sans text-sm text-white opacity-60">
            // results from this function are not consistent
            {getFrequencyLabel(
              prompt.notificationConfig_startTime,
              prompt.notificationConfig_endTime,
              prompt.notificationConfig_countPerDay
            )}
          </Text> */}
        </View>
      </View>
      <Button
        variant="ghost"
        className="m-0 p-0 self-center"
        leftIcon={<VerticalMenu />}
      />
    </Pressable>
  );
};
