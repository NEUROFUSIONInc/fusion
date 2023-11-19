import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import { useContext, useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CategoryTag, PromptDetails, Screen, Input } from "~/components";
import { categories, quickAddPrompts } from "~/config";
import { AccountContext } from "~/contexts/account.context";
import { PromptScreenNavigationProp, RouteProp } from "~/navigation";
import { appInsights } from "~/utils";

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

  useEffect(() => {
    appInsights.trackPageView({
      name: "Quick Add Prompts",
      properties: {
        prompt_count: quickAddPrompts?.length,
        userNpub: accountContext?.userNpub,
      },
    });
  }, [quickAddPrompts]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [suggestedPrompts, setSuggestedPrompts] = useState<any[]>([]);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSuggestedPrompts([]);
      return;
    }
    console.log("API call with:", debouncedSearchTerm);
    // now make api call to server
    (async () => {
      try {
        let fusionBackendUrl;
        if (Constants.expoConfig?.extra) {
          fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
        }
        const response = await axios.post(
          `${fusionBackendUrl}/api/getpromptsuggestions`,
          {
            searchTerm,
          },
          {
            headers: {
              Authorization: `Bearer ${accountContext?.userApiToken}`,
            },
          }
        );

        console.log("response", response.data);
        const apiSuggestions = JSON.parse(response.data.suggestions);
        console.log("promptSuggestions", apiSuggestions);

        // now build the list of suggested prompts the fit schema
        const formattedResponse = apiSuggestions.prompts.map((prompt: any) => {
          return {
            uuid: prompt.uuid,
            promptText: prompt.promptText,
            responseType: prompt.responseType,
            notificationConfig_days: {
              sunday: true,
              monday: true,
              tuesday: false,
              wednesday: true,
              thursday: false,
              friday: true,
              saturday: false,
            },
            notificationConfig_startTime: "08:00",
            notificationConfig_endTime: "08:02",
            notificationConfig_countPerDay: 1,
            additionalMeta: {
              category: prompt.category,
              isNotificationActive: true,
            },
          };
        });

        console.log("formattedResponse", formattedResponse);

        setSuggestedPrompts(formattedResponse);
      } catch (e) {
        console.log("error", e);
      }
    })();
  }, [debouncedSearchTerm]);

  return (
    <Screen>
      {quickAddPrompts && quickAddPrompts?.length > 0 && (
        <ScrollView>
          <View className="flex justify-center items-center w-full">
            <Text className="font-sans-bold text-center text-white text-base pb-2">
              What’s been top of mind for you lately
            </Text>
            <Text className="font-sans-light max-w-xs text-center text-white text-base">
              We will use this to suggest you prompts
            </Text>
          </View>
          <Input
            inputMode="text"
            value={searchTerm}
            className="my-5"
            onChangeText={setSearchTerm}
            placeholder="I want to be more energetic about work"
          />
          <View className="mb-10">
            {suggestedPrompts?.length > 0 ? (
              <ScrollView className="flex mt-4 mx-1 flex-col">
                {suggestedPrompts.map((prompt) => (
                  <View key={prompt.uuid ?? Math.random()} className="my-2">
                    <PromptDetails
                      prompt={prompt}
                      variant="add"
                      onClick={() =>
                        navigation.navigate("EditPrompt", {
                          prompt,
                          type: "add",
                        })
                      }
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <>
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
                          navigation.navigate("EditPrompt", {
                            prompt,
                            type: "add",
                          })
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};
