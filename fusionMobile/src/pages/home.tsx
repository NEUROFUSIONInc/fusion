import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React from "react";
import { View, Text } from "react-native";
import {
  ScrollView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { PromptResponse } from "~/@types";
import {
  Screen,
  Button,
  ChevronLeft,
  ChevronRight,
  Reload,
  ThumbsUp,
  ThumbsDown,
} from "~/components";
import { categories } from "~/config";
import { AccountContext } from "~/contexts";
import { usePromptsQuery } from "~/hooks";
import { promptService } from "~/services";
import { appInsights } from "~/utils";

export function HomeScreen() {
  const { data: savedPrompts } = usePromptsQuery();

  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);

  // get all the categories
  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState(0);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {},
    });
  }, []);

  const panActiveInsightCategory = (direction: "left" | "right") => {
    if (direction === "left") {
      if (activeCategoryIndex === 0) {
        setActiveCategoryIndex(categories.length - 1);
      } else {
        setActiveCategoryIndex(activeCategoryIndex - 1);
      }
    } else if (direction === "right") {
      if (activeCategoryIndex === categories.length - 1) {
        setActiveCategoryIndex(0);
      } else {
        setActiveCategoryIndex(activeCategoryIndex + 1);
      }
    }
  };

  const [summaryText, setSummaryText] = React.useState("Loading summary...");

  const getInsightSummary = async (category: string) => {
    // only run this function if user has consented for FusionCopilot
    const copilotConsent = accountContext?.userPreferences.enableCopilot!;
    if (copilotConsent !== true)
      return "Enable Fusion Copilot to see get smart summaries and personalized recommendations based on your responses.";

    const filteredPrompts = savedPrompts!.filter(
      (prompt) => prompt.additionalMeta?.category === category
    );

    if (filteredPrompts.length === 0) {
      return "You need to add prompts to this category in order to see insights.";
    }

    const categoryPromptResponses: PromptResponse[] = [];
    // we want to be able to look back a bit more if not enough responses
    const pastWeekTimestamp = dayjs().subtract(7, "day").valueOf();
    await Promise.all(
      filteredPrompts.map(async (prompt) => {
        const res = await promptService.getPromptResponses(
          prompt.uuid,
          pastWeekTimestamp
        );
        categoryPromptResponses.push(...res);
      })
    );

    if (categoryPromptResponses.length === 0) {
      return `You haven't responsed any prompts in this category in a while. Add responses to your '${category}' prompts in order to see insights.`;
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
        `${fusionBackendUrl}/api/getpromptsummary`,
        {
          prompts: filteredPrompts,
          responses: categoryPromptResponses,
        },
        {
          headers: {
            Authorization: `Bearer ${accountContext?.userApiToken}`,
          },
        }
      );

      if (res.status === 200) {
        return res.data.summary;
      }
    } catch (err: any) {
      console.log("error", JSON.stringify(err));
      return "Sorry we ran into an error loading summary. Please contact support.";
    }
  };

  const [categoryInsightSummaries, setCategoryInsightSummaries] =
    React.useState<{ [key: string]: string }>({});

  const onHandlerStateChange = (event: {
    nativeEvent: { state: number; translationX: number };
  }) => {
    if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX < -50
    ) {
      // Check if the swipe is left (translationX is less than -50)
      panActiveInsightCategory("right");
    } else if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX > 50
    ) {
      // Check if the swipe is right (translationX is greater than 50)
      panActiveInsightCategory("left");
    }
  };

  React.useEffect(() => {
    if (!savedPrompts) return;
    if (accountContext?.userLoading) return;
    (async () => {
      // make a batch request for summary of each category
      categories.forEach(async (category) => {
        const ai_summary = await getInsightSummary(category.name);
        setCategoryInsightSummaries((prev) => ({
          ...prev,
          [category.name]: ai_summary,
        }));
      });
    })();
  }, [
    savedPrompts,
    accountContext?.userLoading,
    accountContext?.userPreferences.enableCopilot,
  ]);

  // get the summary for the active category
  React.useEffect(() => {
    if (!categoryInsightSummaries) return;
    const selectedCategory = categories[activeCategoryIndex].name;
    setSummaryText(categoryInsightSummaries[selectedCategory]);
  }, [categoryInsightSummaries, activeCategoryIndex]);
  // now that we have all the summaries, set the summary text

  return (
    <Screen>
      <View className="flex flex-row w-full justify-between p-5">
        <Text className="text-base font-sans-bold text-white">
          Fusion Copilot
        </Text>
      </View>

      {/* show each category at a time */}
      {/* TODO: sort category list based on the prompts with more responses. `rank` property */}
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <ScrollView nestedScrollEnabled>
          <View className="flex flex-col w-full bg-secondary-900 rounded">
            <View className="flex flex-row w-full h-auto justify-between p-3 border-b-2 border-tint rounded-t">
              <Button
                variant="ghost"
                size="icon"
                leftIcon={<ChevronLeft />}
                onPress={() => panActiveInsightCategory("left")}
              />

              <Text className="font-sans text-base text-white text-[20px] ml-2 w-[80%] text-center">
                {categories[activeCategoryIndex].icon}{" "}
                {categories[activeCategoryIndex].name}
              </Text>

              <Button
                variant="ghost"
                size="icon"
                leftIcon={<ChevronRight />}
                onPress={() => panActiveInsightCategory("right")}
              />
            </View>

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
                      category: categories[activeCategoryIndex].name,
                    },
                  });

                  // reload the summary
                  setSummaryText("Loading summary...");
                  (async () => {
                    const ai_summary = await getInsightSummary(
                      categories[activeCategoryIndex].name
                    );
                    setCategoryInsightSummaries((prev) => ({
                      ...prev,
                      [categories[activeCategoryIndex].name]: ai_summary,
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
                        category: categories[activeCategoryIndex].name,
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
                        category: categories[activeCategoryIndex].name,
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
      </PanGestureHandler>

      {!accountContext?.userLoading &&
        accountContext?.userPreferences.enableCopilot !== true && (
          <Button
            onPress={() => {
              navigation.navigate("SettingsPage");
            }}
            title="Enable Fusion Copilot"
            fullWidth
            className="mt-5 bg-secondary-900"
            variant="secondary"
          />
        )}

      {/* connect your apple health data */}
    </Screen>
  );
}
