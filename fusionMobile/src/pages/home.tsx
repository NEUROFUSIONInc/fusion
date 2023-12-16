import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React, { useMemo, useState } from "react";
import { View, Text, Linking, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { Prompt, PromptResponse } from "~/@types";
import {
  Screen,
  Button,
  Reload,
  ThumbsUp,
  ThumbsDown,
  Modal,
  CategoryTag,
  ChevronRight,
  ChatBubble,
} from "~/components";
import { categories } from "~/config";
import { AccountContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { promptService } from "~/services";
import { appInsights, getTimeOfDay } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

export function HomeScreen() {
  const { data: savedPrompts } = usePromptsQuery();

  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);

  const [missedPrompts, setMissedPrompts] = useState<Prompt[]>();

  const [categoryInsightSummaries, setCategoryInsightSummaries] =
    React.useState<{ [key: string]: string }>({});

  const [summaryText, setSummaryText] = React.useState("Loading summary...");

  const [timePeriod, setTimePeriod] = React.useState<"week" | "month">("week");
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const categoryPillsToDisplay = useMemo(() => {
    const categoriesToDisplay = categories.filter(
      (category) =>
        savedPrompts?.filter(
          (prompt) => prompt.additionalMeta?.category === category.name
        )?.length! > 0
    );

    setActiveCategory(categoriesToDisplay![0]);
    return categoriesToDisplay;
  }, [savedPrompts]);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });
  }, []);

  React.useEffect(() => {
    console.log("activeCategory", activeCategory);
    if (!savedPrompts) return;
    if (savedPrompts.length === 0) {
      // redirect to prompts page
      navigation.navigate("PromptNavigator", {
        screen: "QuickAddPrompts",
      });
    }
    if (accountContext?.userLoading) return;
    if (!activeCategory) return;
    (async () => {
      setSummaryText("Loading summary...");
      // make a batch request for summary of each category
      categoryPillsToDisplay.forEach(async (category) => {
        const ai_summary = await getInsightSummary(category.name);
        setCategoryInsightSummaries((prev) => ({
          ...prev,
          [category.name]: ai_summary,
        }));
      });

      // check if user has missed any prompts
      const res = await promptService.getMissedPromptsToday();
      if (res) {
        setMissedPrompts(res);
        appInsights.trackEvent({
          name: "show_missed_prompts",
          properties: {
            userNpub: accountContext?.userNpub,
            missedPrompts: res?.length,
          },
        });
      }
    })();
  }, [
    savedPrompts,
    accountContext?.userLoading,
    accountContext?.userPreferences.enableCopilot,
    timePeriod,
    activeCategory,
  ]);

  // get the summary for the active category
  React.useEffect(() => {
    if (!categoryInsightSummaries) return;
    if (!activeCategory) return;
    setSummaryText(categoryInsightSummaries[activeCategory.name]);
  }, [categoryInsightSummaries, activeCategory]);

  const getInsightSummary = async (category: string) => {
    // only run this function if user has consented for FusionCopilot
    const copilotConsent = accountContext?.userPreferences.enableCopilot!;
    if (copilotConsent !== true)
      return "Use Fusion Copilot to see get summaries and personalized recommendations.";

    const filteredPrompts = savedPrompts!.filter(
      (prompt) => prompt.additionalMeta?.category === category
    );

    if (filteredPrompts.length === 0) {
      return "Add prompts to this category to get summaries and personalized recommendations.";
    }

    const categoryPromptResponses: PromptResponse[] = [];
    // we want to be able to look back a bit more if not enough responses
    const pastPeriodTimestamp = dayjs().subtract(1, timePeriod).valueOf();
    await Promise.all(
      filteredPrompts.map(async (prompt) => {
        const res = await promptService.getPromptResponses(
          prompt.uuid,
          pastPeriodTimestamp
        );
        categoryPromptResponses.push(...res);
      })
    );

    if (categoryPromptResponses.length === 0) {
      return `You haven't responsed any prompts in this category recently. Add responses to your '${category}' prompts in order to see insights.`;
    }

    // sort responses by timestamp ascending
    categoryPromptResponses.sort(
      (a, b) => a.responseTimestamp - b.responseTimestamp
    );

    let fusionBackendUrl = "";
    if (Constants.expoConfig?.extra) {
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }

    try {
      const res = await axios.post(
        `${fusionBackendUrl}/api/getpromptsummary/v2`,
        {
          prompts: filteredPrompts,
          responses: categoryPromptResponses,
          timePeriod,
        },
        {
          headers: {
            Authorization: `Bearer ${accountContext?.userApiToken}`,
          },
        }
      );

      appInsights.trackEvent({
        name: "fusion_copilot_trigger",
        properties: {
          category,
          userNpub: accountContext?.userNpub,
          status: "success",
        },
      });

      if (res.status === 200) {
        return res.data.summary;
      }
    } catch (err: any) {
      console.log("error", JSON.stringify(err));
      appInsights.trackEvent({
        name: "fusion_copilot_trigger",
        properties: {
          category,
          userNpub: accountContext?.userNpub,
          status: "failed",
        },
      });
      return "Sorry we ran into an error loading summary. Please contact support.";
    }
  };

  return (
    <Screen>
      <View className="flex-1">
        <ScrollView>
          {/* Fusion Copilot Card */}
          <>
            <View className="flex flex-row w-full justify-between p-5 items-center">
              <Text className="text-base font-sans-bold text-white justify">
                Fusion Copilot
              </Text>

              {activeCategory && categoryPillsToDisplay.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    // show an alert with all the active categories
                    // when they click on one, set it as the active category
                    // and close the alert
                    Alert.alert(
                      "Recommendation Category",
                      "Select a category to see insights for",
                      categoryPillsToDisplay.map((category) => ({
                        text: category.name,
                        onPress: () => {
                          setActiveCategory(category);
                        },
                      }))
                    );
                  }}
                >
                  <CategoryTag
                    key={activeCategory.name}
                    title={activeCategory.name}
                    isActive
                    disabled
                    icon={activeCategory.icon}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* show each category at a time */}
            {/* TODO: sort category list based on the prompts with more responses. `rank` property */}
            <ScrollView nestedScrollEnabled>
              <View className="flex flex-col w-full bg-secondary-900 rounded">
                <View>
                  <Text
                    ellipsizeMode="tail"
                    className="font-sans flex flex-wrap text-white text-base font-medium m-5"
                  >
                    {summaryText ? summaryText : "Loading summary..."}
                  </Text>
                </View>

                <View className="flex flex-row w-full justify-between p-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    leftIcon={<Reload />}
                    onPress={() => {
                      appInsights.trackEvent({
                        name: "fusion_copilot_reload_summary",
                        properties: {
                          category: activeCategory?.name,
                          userNpub: accountContext?.userNpub,
                        },
                      });

                      // reload the summary
                      setSummaryText("Loading summary...");
                      (async () => {
                        const ai_summary = await getInsightSummary(
                          activeCategory.name
                        );
                        setCategoryInsightSummaries((prev) => ({
                          ...prev,
                          [activeCategory.name]: ai_summary,
                        }));
                      })();
                    }}
                  />

                  <View className="flex flex-row gap-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      leftIcon={<ThumbsUp />}
                      onPress={() => {
                        appInsights.trackEvent({
                          name: "fusion_copilot_feedback",
                          properties: {
                            feedback: "thumps_up",
                            category: activeCategory.name,
                            userNpub: accountContext?.userNpub,
                          },
                        });
                        Toast.show({
                          type: "success",
                          // text1: "Feedback sent",
                          text2:
                            "Thank you for your feedback! Glad the insight was helpful.",
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      leftIcon={<ThumbsDown />}
                      onPress={() => {
                        appInsights.trackEvent({
                          name: "fusion_copilot_feedback",
                          properties: {
                            feedback: "thumbs_down",
                            category: activeCategory.name,
                            userNpub: accountContext?.userNpub,
                          },
                        });

                        Toast.show({
                          type: "success",
                          // text1: "Feedback sent",
                          text2:
                            "Thank you for your feedback! It helps us improve.",
                        });
                      }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Contextual action buttons */}
            <View className="flex justify-between mb-5 mt-5">
              {/* Enable Copliot */}
              {!accountContext?.userLoading &&
                accountContext?.userPreferences.enableCopilot !== true && (
                  <Button
                    onPress={async () => {
                      // call bottom sheet
                      const consentStatus = await requestCopilotConsent(
                        accountContext!.userNpub
                      );
                      accountContext?.setUserPreferences({
                        ...accountContext.userPreferences,
                        enableCopilot: consentStatus,
                      });
                    }}
                    title="Enable Fusion Copilot"
                    fullWidth
                    className="bg-secondary-900"
                    variant="secondary"
                  />
                )}

              {/* Connect with data source */}
              <Button
                title="View Responses"
                fullWidth
                onPress={async () => {
                  const val = activeCategory.name;
                  navigation.navigate("InsightsNavigator", {
                    screen: "InsightsPage",
                    params: {
                      promptUuid: savedPrompts?.find(
                        (prompt) =>
                          prompt.additionalMeta?.category ===
                          activeCategory.name
                      )?.uuid,
                    },
                  });
                }}
                className="bg-secondary-900 flex justify-between"
                variant="secondary"
                rightIcon={<ChevronRight />}
              />

              {/* Display Related Resources */}
              {activeCategory && activeCategory.name === "Mental Health" && (
                <Button
                  onPress={async () => {
                    await Linking.openURL(
                      "https://cmha.ca/find-info/mental-health/general-info/"
                    );
                  }}
                  title="Mental Health Resources"
                  fullWidth
                  className="bg-secondary-900 flex justify-between"
                  variant="secondary"
                  rightIcon={<ChevronRight />}
                />
              )}
              {/* Display Fitness Resources */}
              {activeCategory &&
                activeCategory.name === "Health and Fitness" && (
                  <Button
                    onPress={async () => {
                      await Linking.openURL(
                        "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
                      );
                    }}
                    title="Learn more about physical activity"
                    fullWidth
                    className="bg-secondary-900 flex justify-between"
                    variant="secondary"
                    rightIcon={<ChevronRight />}
                  />
                )}

              {/* TODO: display sleep activity & heart rate */}
              {/* {!accountContext?.userLoading &&
              accountContext?.userPreferences["enableHealthConnect"] ===
                true ? (
                <View className="">
                  <View className="flex flex-row w-full justify-between p-5">
                    <Text className="text-base font-sans-bold text-white">
                      Health & Activity
                    </Text>
                  </View>

                  <View className="flex flex-col w-full bg-secondary-900 rounded">
                    <Text className="text-base font-sans text-white p-5">
                      Sleep Heart Rate Activity
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <Button
                    title="Sync your sleep, activity & heart rate"
                    fullWidth
                    onPress={async () => {
                      // reuse functions from settings page
                      await connectAppleHealth();
                    }}
                    className="bg-secondary-900 flex justify-between"
                    variant="secondary"
                    rightIcon={<ChevronRight />}
                  />
                </>
              )} */}
            </View>
          </>
        </ScrollView>
        <ChatBubble />

        {missedPrompts && missedPrompts.length > 0 && (
          <Modal
            message={`👋🏾  Good ${getTimeOfDay(
              dayjs(),
              false
            )}, \n Let's catch up on prompts you missed!`}
            clickText="Check in ✨"
            clickAction={() => {
              // send them to the prompt entry page
              // there may be multiple prompt
              navigation.navigate("PromptNavigator", {
                screen: "PromptEntry",
                params: {
                  promptUuid: missedPrompts[0].uuid,
                  prompts: missedPrompts,
                  index: 0,
                },
              });
            }}
            dismissAction={() => {
              // dismiss the modal
              appInsights.trackEvent({
                name: "dismiss_missed_prompt_modal",
                properties: {
                  userNpub: accountContext?.userNpub,
                },
              });
              setMissedPrompts([]);
            }}
          />
        )}
      </View>
    </Screen>
  );
}
