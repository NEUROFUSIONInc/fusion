import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React from "react";
import { View, Text, Linking } from "react-native";
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
      properties: {
        userNpub: accountContext?.userNpub,
      },
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

  const [timePeriod, setTimePeriod] = React.useState<"week" | "month">("week");

  const getInsightSummary = async (category: string) => {
    // only run this function if user has consented for FusionCopilot
    const copilotConsent = accountContext?.userPreferences.enableCopilot!;
    if (copilotConsent !== true)
      return "Use Fusion Copilot to see get summaries and personalized recommendations based on your responses.";

    const filteredPrompts = savedPrompts!.filter(
      (prompt) => prompt.additionalMeta?.category === category
    );

    if (filteredPrompts.length === 0) {
      return "You need to add prompts to this category to get summaries and personalized recommendations.";
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

  // order by categories by prompts with responses

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
    if (savedPrompts.length === 0) {
      // redirect to prompts page
      navigation.navigate("PromptNavigator", {
        screen: "Prompts",
        params: {
          selectedCategory: categories[activeCategoryIndex].name,
        },
      });
    }
    if (accountContext?.userLoading) return;
    (async () => {
      setSummaryText("Loading summary...");
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
    timePeriod,
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
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <View className="h-full">
          <View className="flex flex-row w-full justify-between p-5">
            <Text className="text-base font-sans-bold text-white">
              Fusion Copilot
            </Text>

            {accountContext?.userPreferences.enableCopilot === true && (
              <Text
                className="text-base font-sans text-lime"
                onPress={() =>
                  setTimePeriod(timePeriod === "week" ? "month" : "week")
                }
              >
                This {timePeriod === "week" ? "week" : "month"}
              </Text>
            )}
          </View>

          {/* show each category at a time */}
          {/* TODO: sort category list based on the prompts with more responses. `rank` property */}
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
                        userNpub: accountContext?.userNpub,
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
                          category: categories[activeCategoryIndex].name,
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

          {!accountContext?.userLoading &&
            accountContext?.userPreferences.enableCopilot !== true && (
              <Button
                onPress={() => {
                  navigation.navigate("SettingsPage");
                }}
                title="Enable Fusion Copilot"
                fullWidth
                className=" bg-secondary-900 my-5"
                variant="secondary"
              />
            )}

          <View>
            {!savedPrompts?.find(
              (prompt) =>
                prompt.additionalMeta?.category ===
                categories[activeCategoryIndex].name
            ) ? (
              <Button
                onPress={async () => {
                  const val = categories[activeCategoryIndex].name;
                  navigation.navigate("PromptNavigator", {
                    screen: "Prompts",
                    params: {
                      selectedCategory: val,
                    },
                  });
                }}
                title="Add Prompt"
                fullWidth
                className="bg-secondary-900 my-5"
                variant="secondary"
              />
            ) : (
              <>
                <>
                  <Button
                    title="View Responses"
                    fullWidth
                    onPress={async () => {
                      const val = categories[activeCategoryIndex].name;
                      navigation.navigate("InsightsNavigator", {
                        screen: "InsightsPage",
                        params: {
                          promptUuid: savedPrompts?.find(
                            (prompt) =>
                              prompt.additionalMeta?.category ===
                              categories[activeCategoryIndex].name
                          )?.uuid,
                        },
                      });
                    }}
                    className="bg-secondary-900"
                    variant="secondary"
                  />
                </>
                <>
                  {categories[activeCategoryIndex].name === "Mental Health" && (
                    <Button
                      onPress={async () => {
                        await Linking.openURL(
                          "https://cmha.ca/find-info/mental-health/general-info/"
                        );
                      }}
                      title="Mental Health Resources"
                      fullWidth
                      className=" bg-secondary-900 my-5"
                      variant="secondary"
                    />
                  )}
                  {categories[activeCategoryIndex].name ===
                    "Health and Fitness" && (
                    <Button
                      onPress={async () => {
                        await Linking.openURL(
                          "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
                        );
                      }}
                      title="Learn more about physical activity"
                      fullWidth
                      className=" bg-secondary-900 my-5"
                      variant="secondary"
                    />
                  )}
                </>
              </>
            )}
          </View>
        </View>
      </PanGestureHandler>

      {/* connect your apple health data */}
    </Screen>
  );
}
