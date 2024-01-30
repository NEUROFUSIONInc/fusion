import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { View, Text, Pressable } from "react-native";

import { Button } from "./button";
import { Pencil } from "./icons";

import { PromptResponse } from "~/@types";

export interface ResponseTextItemProps {
  timestamp: dayjs.Dayjs;
  textValue: string;
  isEditable?: boolean;
  promptResponse?: PromptResponse;
}

export const ResponseTextItem: React.FC<ResponseTextItemProps> = ({
  timestamp,
  textValue,
  isEditable = false,
  promptResponse,
}) => {
  const [expandText, setExpandText] = React.useState<boolean>(false);

  const navigation = useNavigation();

  const toggleExpand = () => {
    setExpandText(!expandText);
  };

  return (
    <View
      key={Math.random() * 1000}
      className="pb-3 mb-3 border-b-[1px] border-tint flex flex-row justify-between"
    >
      <Pressable onPress={toggleExpand} className="max-w-[90%]">
        {expandText ? (
          <Text className="font-sans flex flex-wrap text-white text-base font-medium">
            {textValue}
          </Text>
        ) : (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="font-sans flex flex-wrap text-white text-base font-medium"
          >
            {textValue}
          </Text>
        )}
        <View className="flex flex-row gap-x-2 items-center mt-1">
          <Text className="font-sans text-sm text-white opacity-60">
            {dayjs(timestamp).format("dd MMM D, YYYY")}
          </Text>
          <View className="w-1 h-1 bg-white opacity-60" />
          <Text className="font-sans text-sm text-white opacity-60">
            {dayjs(timestamp).format("h:mma")}
          </Text>
        </View>
      </Pressable>

      {isEditable && promptResponse && (
        <View className="flex flex-row justify-end mt-2 ">
          <Button
            variant="ghost"
            size="icon"
            leftIcon={<Pencil />}
            onPress={() => {
              navigation.navigate("PromptNavigator", {
                screen: "PromptEntry",
                params: {
                  promptUuid: promptResponse.promptUuid,
                  triggerTimestamp: promptResponse.triggerTimestamp,
                  previousPromptResponse: promptResponse,
                },
              });
            }}
          />
        </View>
      )}
    </View>
  );
};
