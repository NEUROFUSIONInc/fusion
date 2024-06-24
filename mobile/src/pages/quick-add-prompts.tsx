import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CategoryTag, PromptDetails, Screen } from "~/components";
import { categories, quickAddPrompts } from "~/config";
import { AccountContext } from "~/contexts/account.context";
import { PromptScreenNavigationProp, RouteProp } from "~/navigation";
import { appInsights } from "~/utils";

export const QuickAddPromptsScreen = () => {
  const route = useRoute<RouteProp<"QuickAddPrompts">>();
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    route.params?.selectedCategory ?? ""
  );
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "") {
      return quickAddPrompts;
    } else {
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
  const [suggestedPrompts, setSuggestedPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const generatePrompts = async () => {
    if (!searchTerm) {
      setSuggestedPrompts([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        let fusionBackendUrl;
        if (Constants.expoConfig?.extra) {
          fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
        }
        appInsights.trackEvent({
          name: "prompt_suggestion_init",
          properties: {
            userNpub: accountContext?.userNpub,
          },
        });
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

        appInsights.trackEvent({
          name: "prompt_suggestion_complete",
          properties: {
            userNpub: accountContext?.userNpub,
            prompt_count: formattedResponse ? formattedResponse.length : 0,
          },
        });

        setLoading(false);
        setSuggestedPrompts(formattedResponse);
      } catch (e) {
        appInsights.trackException({
          exception: new Error("CORE_API_ERROR"),
          properties: {
            message: "Error generating prompt suggestions",
            userNpub: accountContext?.userNpub,
          },
        });
        setSuggestedPrompts([]);
        setLoading(false);
        Alert.alert(
          "Error",
          "Something went wrong & we've notified the team. Please try again later"
        );
      }
    })();
  };

  return (
    <Screen>
      {quickAddPrompts && quickAddPrompts?.length > 0 && (
        <ScrollView>
          <View className="flex justify-center items-center w-full">
            <Text className="font-sans-bold text-center text-white text-base pb-2">
              What’s been on your mind lately?
            </Text>
            <Text className="font-sans-light max-w-xs text-center text-white text-base">
              We will use this to suggest you prompts
            </Text>
          </View>
          <View
            className="
          flex-row items-center p-4 bg-secondary-900 rounded-md
          m-0.5 my-2 mb-5"
          >
            <TextInput
              placeholder="Type in your response..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-white rounded-md font-sans"
              multiline
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity
              className="ml-4 rounded-md"
              onPress={async () => {
                await generatePrompts();
              }}
            >
              <Text className="text-lime font-sans">Suggest</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-10">
            {loading ? (
              <View className="flex justify-center items-center w-full">
                <Text className="font-sans-bold text-center text-white text-base pb-2">
                  Loading...
                </Text>
              </View>
            ) : (
              <>
                {suggestedPrompts?.length > 0 ? (
                  <ScrollView className="flex mt-4 mx-1 flex-col">
                    {suggestedPrompts.map((prompt) => (
                      <View key={prompt.uuid ?? Math.random()} className="my-2">
                        <PromptDetails
                          prompt={prompt}
                          variant="add"
                          displayFrequency={false}
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
                            displayFrequency={false}
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
              </>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};
