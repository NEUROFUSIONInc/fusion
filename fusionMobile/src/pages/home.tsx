import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

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
    const copilotConsent = await SecureStore.getItemAsync("copilotConsent");
    if (copilotConsent !== "true")
      return "You need to enable Fusion Copilot in order to see insights.";

    const filteredPrompts = savedPrompts!.filter(
      (prompt) => prompt.additionalMeta?.category === category
    );

    if (filteredPrompts.length === 0) {
      return "You need to add prompts to this category in order to see insights.";
    }

    const categoryPromptResponses: any = {};
    const pastWeekTimestamp = dayjs().subtract(7, "day").valueOf();
    await Promise.all(
      filteredPrompts.map(async (prompt) => {
        const res = await promptService.getPromptResponses(
          prompt.uuid,
          pastWeekTimestamp
        );
        categoryPromptResponses[prompt.uuid] = res;
      })
    );

    let fusionBackendUrl = "";
    if (Constants.expoConfig?.extra) {
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }

    const res = await axios.post(
      `${fusionBackendUrl}/api/getpromptsummary`,
      {
        prompt: filteredPrompts[0],
        responses: categoryPromptResponses[filteredPrompts[0].uuid],
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
  };

  React.useEffect(() => {
    if (!savedPrompts) return;
    if (accountContext?.userLoading) return;
    (async () => {
      const selectedCategory = categories[activeCategoryIndex].name;

      const ai_summary = await getInsightSummary(selectedCategory);
      setSummaryText(ai_summary);
    })();
  }, [savedPrompts, activeCategoryIndex, accountContext?.userLoading]);

  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-row w-full justify-between p-5">
          <Text className="text-base font-sans-bold text-white">
            Fusion Digest
          </Text>
        </View>

        {/* show each category at a time */}
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
              {summaryText}
            </Text>
          </View>

          <View className="flex flex-row w-full justify-between p-5">
            <Button
              variant="ghost"
              size="icon"
              leftIcon={<Reload />}
              onPress={() => {
                console.log("reloading insight");
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
                      feedback: "thumbs_down",
                    },
                  });
                  Toast.show({
                    type: "success",
                    // text1: "Feedback sent",
                    text2: "Thank you for your feedback!",
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
                    },
                  });

                  Toast.show({
                    type: "success",
                    // text1: "Feedback sent",
                    text2: "Thank you for your feedback!",
                  });
                }}
              />
            </View>
          </View>
        </View>

        {/* connect your apple health data */}
      </ScrollView>
    </Screen>
  );
}
