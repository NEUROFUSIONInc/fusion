import { useNavigation, useRoute } from "@react-navigation/native";
import { useContext, useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Prompt } from "~/@types";
import { Input, CategoryTag, PromptDetails, Screen } from "~/components";
import { categories, quickAddPrompts, suggestedPrompts } from "~/config";
import { AccountContext } from "~/contexts/account.context";
import { PromptScreenNavigationProp, RouteProp } from "~/navigation";
import { appInsights } from "~/utils";

// Define the type for suggested prompts
type SuggestedPrompt = Prompt;

const filterSuggestedPrompts = (
  prompts: SuggestedPrompt[],
  searchTerm: string
): SuggestedPrompt[] => {
  return prompts.filter((prompt) =>
    prompt.promptText.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const QuickAddPromptsScreen = () => {
  const route = useRoute<RouteProp<"QuickAddPrompts">>();
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    route.params?.selectedCategory ?? "All"
  );
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "All" || selectedCategory === "") {
      // Remove "All" category from the list of categories
      const index = categories.findIndex((category) => category.name === "All");
      if (index !== -1) {
        categories.splice(index, 1);
      }
      return quickAddPrompts;
    } else {
      // Add "All" category to the list of categories if it doesn't exist
      const index = categories.findIndex((category) => category.name === "All");
      if (index === -1) {
        categories.unshift({
          name: "All",
          color: "#FFC0CB",
          icon: "💫",
        });
      }
      return selectedCategory
        ? quickAddPrompts?.filter(
            (prompt) => prompt.additionalMeta?.category === selectedCategory
          )
        : quickAddPrompts;
    }
  }, [quickAddPrompts, selectedCategory]);

  const accountContext = useContext(AccountContext);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredSuggestedPrompts = useMemo(() => {
    if (selectedCategory === "Suggested" && searchTerm.trim() !== "") {
      return filterSuggestedPrompts(
        suggestedPrompts as unknown as SuggestedPrompt[],
        searchTerm
      ) as SuggestedPrompt[];
    } else {
      return [];
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    appInsights.trackPageView({
      name: "Quick Add Prompts",
      properties: {
        prompt_count: quickAddPrompts?.length,
        userNpub: accountContext?.userNpub,
      },
    });
  }, [quickAddPrompts]);

  return (
    <Screen>
      {selectedCategory === "Suggested" && (
        <View className="flex justify-center items-center mb-6">
          <Text className="font-sans-bold text-center text-white text-base pb-2">
            What’s been top of mind for you lately
          </Text>
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            We will use this to suggest you prompts
          </Text>
          <Input
            size="lg"
            placeholder="I want to be more energetic about work"
            value={searchTerm}
            className="mt-6"
            onChangeText={(text) => setSearchTerm(text)}
            fullWidth
          />
        </View>
      )}
      {quickAddPrompts && quickAddPrompts?.length > 0 && (
        <View>
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
                  icon={category.icon}
                  isActive={name === selectedCategory}
                  handleValueChange={(checked) =>
                    setSelectedCategory(checked ? name : "")
                  }
                />
              );
            })}
          </ScrollView>
          <ScrollView className="flex mt-4 mx-1 flex-col">
            {filteredPrompts.map((prompt) => (
              <View key={prompt.uuid} className="my-2">
                <PromptDetails
                  prompt={prompt}
                  variant="add"
                  onClick={() =>
                    navigation.navigate("EditPrompt", { prompt, type: "add" })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {suggestedPrompts && suggestedPrompts?.length > 0 && (
        <View className="mb-10">
          <ScrollView className="flex mx-1 flex-col">
            {filteredSuggestedPrompts.map((prompt) => (
              <View key={prompt.uuid} className="my-2">
                <PromptDetails
                  prompt={prompt}
                  variant="add"
                  onClick={() =>
                    navigation.navigate("EditPrompt", { prompt, type: "add" })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </Screen>
  );
};
