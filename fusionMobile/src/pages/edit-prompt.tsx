import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import { PromptResponseType } from "~/@types";
import {
  Button,
  PromptDetailsStep,
  TimePicker,
  promptSelectionDays,
} from "~/components";
import { usePrompt, useUpdatePrompt } from "~/hooks";
import { PromptScreenNavigationProp, RouteProp } from "~/navigation";
import {
  getDayjsFromTimeString,
  appInsights,
  getFrequencyFromCount,
} from "~/utils";

export function PromptScreen() {
  const route = useRoute<RouteProp<"EditPrompt">>();
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const { data: prompt, isLoading: isPromptLoading } = usePrompt(
    route.params.promptId
  );
  const { mutateAsync: updatePrompt, isLoading: isUpdating } = useUpdatePrompt(
    route.params.promptId
  );
  const [promptText, setPromptText] = React.useState("");
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  const [responseType, setResponseType] =
    React.useState<PromptResponseType | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);
  const [countPerDay, setCountPerDay] = React.useState<number | undefined>();
  const [days, setDays] = React.useState(promptSelectionDays);
  const [start, setStart] = React.useState(getDayjsFromTimeString("08:00"));
  const [end, setEnd] = React.useState(getDayjsFromTimeString("22:00"));
  const defaultPromptValue = React.useMemo(
    () => getFrequencyFromCount(start, end, countPerDay ?? 0),
    [start, end, countPerDay]
  );

  const buttonDisabled = React.useMemo(
    () =>
      start.isAfter(end) ||
      start.isSame(end) ||
      Object.values(days).every((value) => !value) ||
      countPerDay === 0 ||
      promptText === "" ||
      responseType === null ||
      category === null ||
      isUpdating,
    [
      start,
      end,
      days,
      countPerDay,
      promptText,
      responseType,
      isUpdating,
      category,
    ]
  );

  // set the prompt object if it was passed in (this is for editing)
  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Edit Prompt",
      properties: {
        intent: "edit",
      },
    });

    if (prompt) {
      setPromptText(prompt.promptText);
      setCustomOptions(
        prompt.additionalMeta?.customOptionText?.split(";") ?? []
      );
      setResponseType(prompt.responseType);
      setCountPerDay(prompt.notificationConfig_countPerDay);
      setDays(prompt.notificationConfig_days);
      setStart(getDayjsFromTimeString(prompt.notificationConfig_startTime));
      setEnd(getDayjsFromTimeString(prompt.notificationConfig_endTime));
      setCategory(prompt.additionalMeta?.category ?? null);
    }
  }, [prompt]);

  const saveEditedPrompt = async () => {
    try {
      await updatePrompt({
        uuid: prompt?.uuid,
        promptText,
        responseType: responseType!,
        notificationConfig_days: days,
        notificationConfig_countPerDay: countPerDay ?? 0,
        notificationConfig_startTime: start.format("HH:mm"),
        notificationConfig_endTime: end.format("HH:mm"),
        additionalMeta: {
          category: category!,
          isNotificationActive: prompt?.additionalMeta.isNotificationActive,
          customOptionText: customOptions.join(";"),
        },
      });
      navigation.navigate("Prompts");
    } catch (err) {
      console.log("Error saving prompt", err);
      throw new Error("There was an error saving the prompt");
    }
  };

  return (
    <ScrollView
      className="flex flex-col bg-dark p-5 pt-2 w-full"
      horizontal={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {isPromptLoading && (
        <Text className="font-sans text-base text-white">Loading...</Text>
      )}
      {!isPromptLoading && prompt && (
        <>
          <PromptDetailsStep
            promptText={promptText}
            setPromptText={setPromptText}
            responseType={responseType}
            setResponseType={setResponseType}
            customOptions={customOptions}
            setCustomOptions={setCustomOptions}
            category={category}
            setCategory={setCategory}
            isCreating={false}
          />
          <View className="flex -z-10">
            <TimePicker
              start={start}
              end={end}
              setEnd={setEnd}
              setStart={setStart}
              days={days}
              setDays={setDays}
              setPromptCount={setCountPerDay}
              defaultPromptValue={defaultPromptValue}
            />
          </View>
          <Button
            title={isUpdating ? "Saving edits..." : "Save edits"}
            loading={isUpdating}
            fullWidth
            className="mt-4 mb-8"
            disabled={buttonDisabled}
            onPress={saveEditedPrompt}
          />
        </>
      )}
    </ScrollView>
  );
}
