import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useNavigation } from "@react-navigation/native";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { allPromptOptionKeys, Prompt, PromptOptionKey } from "~/@types";
import {
  Button,
  CategoryTag,
  Plus,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
} from "~/components";
import { categories } from "~/config";
import { AccountContext } from "~/contexts/account.context";
import { usePromptsQuery } from "~/hooks";
import colors from "~/theme/colors";
import { appInsights } from "~/utils";

export const PromptsScreen = () => {
  const navigation = useNavigation();

  const { data: savedPrompts, isLoading } = usePromptsQuery();
  const [activePrompt, setActivePrompt] = useState<Prompt | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const accountContext = useContext(AccountContext);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "") {
      return savedPrompts;
    } else {
      return selectedCategory
        ? savedPrompts?.filter(
            (prompt) => prompt.additionalMeta?.category === selectedCategory
          )
        : savedPrompts;
    }
  }, [savedPrompts, selectedCategory]);

  const categoryPillsToDisplay = useMemo(() => {
    const categoriesToDisplay = categories.filter(
      (category) =>
        savedPrompts?.filter(
          (prompt) => prompt.additionalMeta?.category === category.name
        )?.length! > 0
    );
    return categoriesToDisplay;
  }, [savedPrompts]);

  useEffect(() => {
    appInsights.trackPageView({
      name: "Prompts",
      properties: {
        prompt_count: savedPrompts?.length,
        userNpub: accountContext?.userNpub,
      },
    });
  }, [savedPrompts]);

  const handleCategorySelection = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const promptOptionsSheetRef = useRef<RNBottomSheet>(null);

  // Bottom sheet for prompt options when user has a list of prompts
  const handlePromptExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
  }, []);

  const handlePromptBottomSheetClose = useCallback(() => {
    setActivePrompt(undefined);
    promptOptionsSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (activePrompt && promptOptionsSheetRef.current) {
      console.log("expanding prompt options sheet");
      setTimeout(() => {
        promptOptionsSheetRef.current?.expand();
      }, 100);
    }
  }, [activePrompt]);

  return (
    <Screen>
      {(!savedPrompts || savedPrompts?.length === 0) && (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image source={require("../../assets/sticky-note.png")} />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Hello, let's get you started
          </Text>
          <Button
            title="Add your first prompt"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={() => {
              navigation.navigate("QuickAddPrompts");
            }}
            className="self-center"
          />
        </View>
      )}
      {!isLoading && savedPrompts && savedPrompts?.length > 0 && (
        <View className="mb-10">
          <ScrollView
            horizontal
            className="gap-x-3 gap-y-3 pl-2"
            showsHorizontalScrollIndicator={false}
          >
            {categoryPillsToDisplay.map((category) => {
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
        {activePrompt && (
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheetRef}
            promptId={activePrompt.uuid}
            onBottomSheetClose={handlePromptBottomSheetClose}
            defaultPrompt={activePrompt}
            optionsList={(() => {
              if (!activePrompt?.additionalMeta?.questId) {
                return allPromptOptionKeys;
              }

              const hasPromptSourceCondition =
                activePrompt.additionalMeta.notifyConditions?.some(
                  (condition) => condition.sourceType === "prompt"
                );

              return hasPromptSourceCondition
                ? [PromptOptionKey.record, PromptOptionKey.previous]
                : [
                    PromptOptionKey.record,
                    PromptOptionKey.previous,
                    PromptOptionKey.edit,
                  ];
            })()}
          />
        )}
      </Portal>
    </Screen>
  );
};
