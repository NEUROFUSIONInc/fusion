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
import { Image, Platform, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import {
  Button,
  CategoryTag,
  Plus,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
  AddPromptSheet,
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
  const promptOptionsSheetRef = useRef<RNBottomSheet>(null);
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

  useEffect(() => {
    /**
     * This delay is added before showing bottom sheet because some time
     * is required for the assignment in react state to reflect in the UI.
     */
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

  // Bottom sheet for prompt options when user has a list of prompts
  const handlePromptExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
  }, []);

  const handlePromptBottomSheetClose = useCallback(() => {
    setActivePrompt(undefined);
    promptOptionsSheetRef.current?.close();
  }, []);

  // Bottom sheets for adding new prompts
  const bottomSheetRef = useRef<RNBottomSheet>(null);

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
            className="flex gap-x-3 gap-y-3 pl-2"
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
                  // displayFrequency={false}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Portal>
        <AddPromptSheet
          bottomSheetRef={bottomSheetRef}
          selectedCategory={selectedCategory}
        />

        {activePrompt && (
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheetRef}
            promptId={activePrompt?.uuid!}
            onBottomSheetClose={handlePromptBottomSheetClose}
            defaultPrompt={activePrompt}
          />
        )}
      </Portal>

      {/* <ChatBubble /> */}
    </Screen>
  );
};
