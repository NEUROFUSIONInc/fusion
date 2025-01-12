import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import { Prompt, PromptResponseType } from "~/@types";
import {
  Button,
  PromptDetailsStep,
  TimePicker,
  promptSelectionDays,
  Screen,
} from "~/components";
import { AccountContext } from "~/contexts/account.context";
import { useCreatePrompt, usePrompt, useUpdatePrompt } from "~/hooks";
import { PromptScreenNavigationProp, RouteProp } from "~/navigation";
import { promptService } from "~/services";
import {
  getDayjsFromTimeString,
  appInsights,
  getFrequencyLabel,
} from "~/utils";

export function EditPromptScreen() {
  const route = useRoute<RouteProp<"EditPrompt">>();
  const params = route.params;
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const isEditPage = params.type === "edit";
  const promptId = isEditPage ? params.promptId : "";
  const { data: promptToEdit, isLoading: isPromptLoading } =
    usePrompt(promptId);
  const { mutateAsync: updatePrompt, isLoading: isUpdating } =
    useUpdatePrompt(promptId);
  const { mutateAsync: createPrompt, isLoading: isCreating } =
    useCreatePrompt();
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);
  const [promptText, setPromptText] = React.useState("");
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  const [responseType, setResponseType] =
    React.useState<PromptResponseType | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);
  const [countPerDay, setCountPerDay] = React.useState<number | undefined>();
  const [days, setDays] = React.useState(promptSelectionDays);
  const [start, setStart] = React.useState(getDayjsFromTimeString("08:00"));
  const [end, setEnd] = React.useState(getDayjsFromTimeString("22:00"));

  const accountContext = React.useContext(AccountContext);
  const buttonDisabled = React.useMemo(
    () =>
      start.isAfter(end) ||
      start.isSame(end) ||
      Object.values(days).every((value) => !value) ||
      countPerDay === 0 ||
      promptText === "" ||
      responseType === null ||
      category === null ||
      isCreating ||
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
      isCreating,
    ]
  );

  // set the prompt object if it was passed in (this is for editing)
  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Edit Prompt",
      properties: {
        intent: "edit",
        userNpub: accountContext?.userNpub,
      },
    });
    const prompt = isEditPage ? promptToEdit : params.prompt;

    if (prompt) {
      setPrompt(prompt);
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
  }, [promptToEdit, params]);

  const savePrompt = async () => {
    const uuid = isEditPage ? promptId : undefined;
    const promptEntry = {
      uuid,
      promptText,
      responseType: responseType!,
      notificationConfig_days: days,
      notificationConfig_countPerDay: countPerDay ?? 0,
      notificationConfig_startTime: start.format("HH:mm"),
      notificationConfig_endTime: end.format("HH:mm"),
      additionalMeta: {
        category: category!,
        isNotificationActive: prompt?.additionalMeta?.isNotificationActive,
        customOptionText: customOptions.join(";"),
        questId: prompt?.additionalMeta?.questId,
        notifyConditions: prompt?.additionalMeta?.notifyConditions,
        singleResponse: prompt?.additionalMeta?.singleResponse,
      },
    };

    try {
      const updateOrCreatePrompt = isEditPage ? updatePrompt : createPrompt;
      await updateOrCreatePrompt({ ...promptEntry });

      // check if other prompts have the current promptId in their conditions
      // if they do update the notificationConfig for those prompts
      if (isEditPage) {
        const allPrompts = await promptService.readSavedPrompts();
        const promptsToUpdate = allPrompts.filter((p: Prompt) => {
          const conditions = p.additionalMeta?.notifyConditions;
          return (
            conditions &&
            Array.isArray(conditions) &&
            conditions.some(
              (condition) =>
                condition.sourceType === "prompt" &&
                condition.sourceId === promptId
            )
          );
        });

        if (promptsToUpdate?.length > 0) {
          console.log("promptsToUpdate", promptsToUpdate);
          await Promise.all(
            promptsToUpdate.map(async (p: Prompt) => {
              await updatePrompt({
                ...p,
                notificationConfig_startTime: start.format("HH:mm"),
                notificationConfig_endTime: end.format("HH:mm"),
                notificationConfig_days: days,
                notificationConfig_countPerDay: countPerDay ?? 0,
              });
            })
          );
        }
      }
      navigation.navigate("Prompts");
    } catch (err) {
      console.log("Error saving prompt", err);
      throw new Error("There was an error saving the prompt");
    }
  };

  return (
    <Screen>
      <ScrollView
        className="flex flex-col bg-dark p-5 pt-2 w-full"
        horizontal={false}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {isPromptLoading && isEditPage && (
          <Text className="font-sans text-base text-white">Loading...</Text>
        )}
        {prompt && (
          <>
            {!prompt.additionalMeta.questId && (
              <View>
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
              </View>
            )}
            <View className="flex -z-10">
              <TimePicker
                start={start}
                end={end}
                setEnd={setEnd}
                setStart={setStart}
                days={days}
                setDays={setDays}
                setPromptCount={setCountPerDay}
                defaultPromptFrequencyLabel={getFrequencyLabel(
                  prompt.notificationConfig_startTime,
                  prompt.notificationConfig_endTime,
                  prompt.notificationConfig_countPerDay
                )}
                hidePromptCountDays={!!prompt.additionalMeta.questId}
              />
            </View>
          </>
        )}
      </ScrollView>
      <Button
        title={
          isEditPage
            ? "Save edits"
            : isCreating
            ? "Adding prompt..."
            : isUpdating
            ? "Updating..."
            : "Add Prompt"
        }
        loading={isUpdating}
        fullWidth
        className="mt-4 mb-4"
        disabled={buttonDisabled}
        onPress={savePrompt}
      />
    </Screen>
  );
}
