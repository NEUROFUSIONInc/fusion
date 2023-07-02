import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { PromptDetails, Screen } from "~/components";
import { quickAddPrompts } from "~/config";
import { PromptScreenNavigationProp } from "~/navigation";
import { appInsights } from "~/utils";

export const QuickAddPromptsScreen = () => {
  const navigation = useNavigation<PromptScreenNavigationProp>();
  useEffect(() => {
    appInsights.trackPageView({
      name: "Quick Add Prompts",
      properties: {
        prompt_count: quickAddPrompts?.length,
      },
    });
  }, [quickAddPrompts]);

  return (
    <Screen>
      {quickAddPrompts && quickAddPrompts?.length > 0 && (
        <ScrollView className="flex mt-4 mx-1 flex-col">
          {quickAddPrompts.map((prompt) => (
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
      )}
    </Screen>
  );
};
