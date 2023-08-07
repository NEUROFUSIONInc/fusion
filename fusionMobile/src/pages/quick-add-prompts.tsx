import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CategoryTag, PromptDetails, Screen } from "~/components";
import { categories, quickAddPrompts } from "~/config";
import { AccountContext } from "~/contexts/account.context";
import { PromptScreenNavigationProp } from "~/navigation";
import { appInsights } from "~/utils";

export const QuickAddPromptsScreen = () => {
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const filteredPrompts = useMemo(() => {
    return selectedCategory
      ? quickAddPrompts?.filter(
          (prompt) => prompt.additionalMeta?.category === selectedCategory
        )
      : quickAddPrompts;
  }, [quickAddPrompts, selectedCategory]);

  const accountContext = useContext(AccountContext);

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
      {quickAddPrompts && quickAddPrompts?.length > 0 && (
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
                  icon={category.icon}
                  isActive={name === selectedCategory}
                  handleValueChange={(checked) =>
                    setSelectedCategory(checked ? name : undefined)
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
    </Screen>
  );
};
