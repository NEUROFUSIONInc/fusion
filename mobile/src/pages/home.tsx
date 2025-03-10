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
} from "~/components";
import { HealthCard } from "~/components/health-details";
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

  const [summaryText, setSummaryText] = React.useState("");

  const [timePeriod, setTimePeriod] = React.useState<"week" | "month">("month");
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
    if (accountContext?.userLoading === false) {
      // set the active category to the last active category
      accountContext?.setUserPreferences({
        ...accountContext.userPreferences,
        lastActiveCategory: activeCategory?.name,
      });
    }
  }, [activeCategory]);

  React.useEffect(() => {
    if (!savedPrompts || savedPrompts.length === 0) {
      setSummaryText("Head over to the Prompts page to get started.");
      // redirect to prompts page
      navigation.navigate("PromptNavigator", {
        screen: "QuickAddPrompts",
      });
    }

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
    if (accountContext?.userLoading) return "Loading summary...";
    // only run this function if user has consented for FusionCopilot
    const copilotConsent = accountContext?.userPreferences.enableCopilot!;
    if (copilotConsent !== true)
      return "Turn on Fusion Copilot in settings page to get summaries and personalized recommendations.";

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

    // TODO: if they haven't responded recently, pass the last 10 responses
    if (categoryPromptResponses.length <= 20) {
      return `Respond to more of your '${category}' prompts in order to get summaries and personalized recommendations.`;
    }

    // sort responses by timestamp ascending
    categoryPromptResponses.sort(
      (a, b) => a.responseTimestamp - b.responseTimestamp
    );

    let fusionBackendUrl = "";
    if (Constants.expoConfig?.extra) {
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }

    console.log(fusionBackendUrl);
    console.log(accountContext?.userApiToken);

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
      let apiErrorMessage = "";
      try {
        console.log("api error:", err.message);
        apiErrorMessage = err.message;
      } catch (e) {}

      appInsights.trackEvent({
        name: "fusion_copilot_trigger",
        properties: {
          category,
          userNpub: accountContext?.userNpub,
          status: "failed",
          apiErrorMessage,
        },
      });
      return "Sorry we ran into an error. Our team has been notified. Please try reloading or check back again.";
    }
  };

  return (
    <Screen>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
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
              overlay={false}
            />
          )}

          <>
            {/* Fusion Copilot Card */}
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
            <View className="flex flex-col w-full bg-secondary-900 rounded">
              <View>
                {/* Enable Copliot */}
                {!accountContext?.userLoading &&
                  accountContext?.userPreferences.enableCopilot !== true && (
                    <View className="flex flex-row w-full justify-between p-5">
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
                        title="Get personalized recommendations"
                        className="px-4 py-2 self-center"
                        fullWidth
                      />
                    </View>
                  )}

                {/* Summary Text */}
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
                  disabled={
                    !accountContext?.userPreferences.enableCopilot ||
                    !activeCategory
                  }
                />

                <View className="flex flex-row gap-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    leftIcon={<ThumbsUp />}
                    disabled={
                      !accountContext?.userPreferences.enableCopilot ||
                      !activeCategory
                    }
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
                    disabled={
                      !accountContext?.userPreferences.enableCopilot ||
                      !activeCategory
                    }
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

            <HealthCard />

            {/* Contextual action buttons */}
            <View className="flex justify-between mb-5 mt-5">
              {/* Connect with data source */}
              {savedPrompts && savedPrompts.length > 0 && (
                <Button
                  title="View Insights"
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
                  className="bg-secondary-900 flex justify-between mb-2"
                  variant="secondary"
                  rightIcon={<ChevronRight />}
                />
              )}

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
                  className="bg-secondary-900 flex justify-between mb-2"
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
                    className="bg-secondary-900 flex justify-between mb-2"
                    variant="secondary"
                    rightIcon={<ChevronRight />}
                  />
                )}
            </View>
          </>
        </ScrollView>
        {/* <ChatBubble /> */}
      </View>
    </Screen>
  );
}
