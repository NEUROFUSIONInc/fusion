import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React, { useMemo, useState } from "react";
import { View, Linking } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Prompt, PromptResponse } from "~/@types";
import { Screen, Modal, ChatBubble, CopilotTrigger } from "~/components";
import { HealthCard } from "~/components/health-details";
import { categories } from "~/config";
import { AccountContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { promptService } from "~/services";
import { appInsights, getTimeOfDay } from "~/utils";

export function HomeScreen() {
  const { data: savedPrompts } = usePromptsQuery();

  const navigation = useNavigation<any>();
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

  const handleSuggestionPress = (suggestionText: string) => {
    // Track suggestion selection
    appInsights.trackEvent({
      name: "home_suggestion_selected",
      properties: {
        suggestion: suggestionText,
        category: activeCategory?.name,
        userNpub: accountContext?.userNpub,
      },
    });

    // Navigate to chat with the suggestion
    // Note: In a real implementation, you would need to store this message
    // in global state or pass it through a context to be accessed in the ChatPage
    navigation.navigate("ChatPage");
  };

  // Suggestions based on active category
  const getHomeSuggestions = () => {
    if (!activeCategory) return [];

    // Default suggestions
    const defaultSuggestions = [
      {
        title: "View Insights",
        text: "Show me insights from my data",
        onPress: () => {
          if (savedPrompts && savedPrompts.length > 0) {
            const promptUuid = savedPrompts.find(
              (prompt) =>
                prompt.additionalMeta?.category === activeCategory.name
            )?.uuid;

            if (promptUuid) {
              navigation.navigate("InsightsNavigator", {
                screen: "InsightsPage",
                params: {
                  promptUuid,
                },
              });
            }
          }
        },
      },
      {
        title: "Chat About Health",
        text: "What patterns do you see in my data?",
        onPress: () =>
          handleSuggestionPress("What patterns do you see in my health data?"),
      },
    ];

    // Category-specific suggestions
    if (activeCategory.name === "Mental Health") {
      return [
        ...defaultSuggestions,
        {
          title: "Mental Health Tips",
          text: "How can I improve my mental wellbeing?",
          onPress: () =>
            handleSuggestionPress("How can I improve my mental wellbeing?"),
        },
        {
          title: "Find Resources",
          text: "What mental health resources are available?",
          onPress: async () => {
            await Linking.openURL(
              "https://cmha.ca/find-info/mental-health/general-info/"
            );
          },
        },
      ];
    } else if (activeCategory.name === "Health and Fitness") {
      return [
        ...defaultSuggestions,
        {
          title: "Fitness Recommendations",
          text: "What exercises should I try?",
          onPress: () =>
            handleSuggestionPress(
              "What exercises should I try based on my health data?"
            ),
        },
        {
          title: "Activity Guidelines",
          text: "Learn about physical activity",
          onPress: async () => {
            await Linking.openURL(
              "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
            );
          },
        },
      ];
    }

    return defaultSuggestions;
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
            <HealthCard />

            <CopilotTrigger
              summaryText={summaryText}
              contextName={activeCategory?.name}
              disableActions={!activeCategory}
              onReloadSummary={() => {
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
              suggestions={getHomeSuggestions()}
            />
          </>
        </ScrollView>
        <ChatBubble />
      </View>
    </Screen>
  );
}
