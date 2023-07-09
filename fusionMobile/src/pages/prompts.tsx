import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import {
  Button,
  CategoryTag,
  CreatePromptSheet,
  Plus,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
} from "~/components";
import { categories } from "~/config";
import { usePromptsQuery } from "~/hooks";
import colors from "~/theme/colors";
import { appInsights } from "~/utils";

export const PromptsScreen = () => {
  const { data: savedPrompts, isLoading } = usePromptsQuery();
  const promptSheetRef = useRef<RNBottomSheet>(null);
  const [activePrompt, setActivePrompt] = useState<Prompt | undefined>();
  const promptOptionsSheetRef = useRef<RNBottomSheet>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const filteredPrompts = useMemo(() => {
    return selectedCategory
      ? savedPrompts?.filter(
          (prompt) => prompt.additionalMeta?.category === selectedCategory
        )
      : savedPrompts;
  }, [savedPrompts, selectedCategory]);

  useEffect(() => {
    appInsights.trackPageView({
      name: "Prompts",
      properties: {
        prompt_count: savedPrompts?.length,
      },
    });
  }, [savedPrompts]);

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

  const handleCategorySelection = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handlePromptExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
  }, []);

  const handlePromptBottomSheetClose = useCallback(() => {
    setActivePrompt(undefined);
    promptOptionsSheetRef.current?.close();
  }, []);

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
        <View className="mb-10">
          <ScrollView
            horizontal
            className="flex gap-x-3 gap-y-3 pl-2"
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const name = category.name;
              return (
                <CategoryTag
                  key={name}
                  title={name}
                  isActive={selectedCategory === name}
                  icon={category.icon}
                  handleValueChange={(checked) =>
                    handleCategorySelection(checked ? name : "")
                  }
                />
              );
            })}
          </ScrollView>
          <ScrollView className="flex mt-4 flex-col">
            {filteredPrompts?.map((prompt) => (
              <View key={prompt.uuid} className="my-2">
                <PromptDetails
                  prompt={prompt}
                  onClick={() => handlePromptExpandSheet(prompt)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
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
