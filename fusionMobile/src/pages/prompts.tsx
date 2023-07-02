import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import {
  Button,
  CreatePromptSheet,
  Plus,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
} from "~/components";
import { usePromptsQuery } from "~/hooks";
import colors from "~/theme/colors";
import { appInsights } from "~/utils";

export const PromptsScreen = () => {
  const { data: savedPrompts, isLoading } = usePromptsQuery();
  const promptSheetRef = useRef<RNBottomSheet>(null);

  useEffect(() => {
    appInsights.trackPageView({
      name: "Prompts",
      properties: {
        prompt_count: savedPrompts?.length,
      },
    });
  }, [savedPrompts]);

  const [activePrompt, setActivePrompt] = useState<Prompt | undefined>();
  const promptOptionsSheetRef = useRef<RNBottomSheet>(null);

  const handlePromptExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
  }, []);

  const handlePromptBottomSheetClose = useCallback(() => {
    setActivePrompt(undefined);
    promptOptionsSheetRef.current?.close();
  }, []);

  useEffect(() => {
    let delayMs = 300;
    if (Platform.OS === "android") {
      delayMs = 500;
    }
    if (activePrompt) {
      const timeout = setTimeout(() => {
        promptOptionsSheetRef.current?.expand();
      }, delayMs);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activePrompt]);

  return (
    <Screen>
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && savedPrompts?.length === 0 && (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image source={require("../../assets/sticky-note.png")} />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Looks like you haven’t created any prompt. Click the button below to
            get started.
          </Text>
          <Button
            title="Create your first prompt"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={() => promptSheetRef.current?.expand()}
            className="self-center"
          />
        </View>
      )}
      {!isLoading && savedPrompts && savedPrompts?.length > 0 && (
        <ScrollView className="flex mt-4 flex-col">
          {savedPrompts.map((prompt) => (
            <View key={prompt.uuid} className="my-2">
              <PromptDetails
                prompt={prompt}
                onClick={() => handlePromptExpandSheet(prompt)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <Portal>
        <CreatePromptSheet promptSheetRef={promptSheetRef} />

        {activePrompt && (
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheetRef}
            promptId={activePrompt?.uuid!}
            onBottomSheetClose={handlePromptBottomSheetClose}
            defaultPrompt={activePrompt}
          />
        )}
      </Portal>
    </Screen>
  );
};
