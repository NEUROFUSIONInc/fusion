import { Portal } from "@gorhom/portal";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import Toast from "react-native-toast-message";

import { Prompt } from "~/@types";
import {
  Button,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
} from "~/components";
import { HealthCard } from "~/components/health-details";
import { AccountContext } from "~/contexts";
import { RouteProp } from "~/navigation";
import { promptService } from "~/services";
import { questService } from "~/services/quest.service";
import { appInsights, getApiService } from "~/utils";

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();

  const route = useRoute<RouteProp<"QuestDetailScreen">>();

  const [addedQuestPrompts, setAddQuestPrompts] = React.useState<Prompt[]>([]);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "QuestDetail",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    (async () => {
      const questPrompts = await questService.fetchQuestPrompts(
        route.params.quest.guid
      );
      if (questPrompts) {
        // it'll be slow for now but find prompt from db & set it
        const fetchPrompts = async () => {
          const fetchedPrompts = await Promise.all(
            questPrompts.map(async (qp) => {
              const prompt = await promptService.getPrompt(qp.promptId);
              if (prompt) {
                return prompt;
              }
            })
          );
          const filteredPrompts = fetchedPrompts.filter(
            (prompt) => prompt !== undefined
          );
          if (filteredPrompts) setAddQuestPrompts(filteredPrompts);
        };

        fetchPrompts();
      }

      await getQuestSubscriptionStatus();
    })();
  }, []);

  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const getQuestSubscriptionStatus = async () => {
    /**
     * Combination of it quest is saved locally & if api returns user subscription status
     */
    try {
      const getQuest = await questService.getSingleQuest(
        route.params.quest.guid
      );
      if (getQuest) {
        console.log("Quest is saved locally so user is subscribed", getQuest);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Failed to get quest subscription status", error);
    }
  };

  const addUserToQuest = async () => {
    /**
     * 1. Display consent dialog
     * 2. Add user to quest
     * 3. Save prompts in db - if they exist (rec) 1 prompt
     * 4. Fetch health data - if required
     * 5. Show success toast
     */
    // TODO: display consent dialog
    // consent - ['I agree to participate in this quest',
    // 'I agree to share data I collect with the quest organizer',
    //  'I want to share my data anoymously with the research community']
    try {
      // remote call to add user to quest
      const apiService = await getApiService();
      if (apiService === null) {
        return;
      }
      const addUserResponse = await apiService.post(`/quest/join`, {
        questId: route.params.quest.guid,
        data: {
          consentClaims: ["I agree to participate in this quest"],
          displayName: "Test User",
        },
      });

      // set: is subscribed.. event
      if (addUserResponse.status >= 200 && addUserResponse.status < 300) {
        console.log("User added to quest successfully");
        console.log(addUserResponse.data);

        // save quest locally
        const res = await questService.saveQuest(route.params.quest);

        if (!res) {
          // show error toast
          throw new Error("Failed to save quest locally");
        }

        setIsSubscribed(true);

        appInsights.trackEvent({
          name: "fusion_quest_join",
          properties: {
            userNpub: accountContext?.userNpub,
            questGuid: route.params.quest.guid,
            // TODO: add consent claims
          },
        });

        // todo: show success toast
        Toast.show({
          type: "success",
          text1: "Quest Started",
          text2: "You have successfully joined the quest!",
        });
      } else {
        console.log(addUserResponse.status);
      }
    } catch (error) {
      appInsights.trackEvent({
        name: "fusion_quest_join_error",
        properties: {
          userNpub: accountContext?.userNpub,
          questGuid: route.params.quest.guid,
        },
      });
      console.error("Failed to add user to quest", error);
    }
  };

  const [activePrompt, setActivePrompt] = useState<Prompt | undefined>();
  const promptOptionsSheetRef = useRef<RNBottomSheet>(null);
  // Bottom sheet for prompt options when user has a list of prompts
  const handlePromptExpandSheet = useCallback((prompt: Prompt) => {
    setActivePrompt(prompt);
  }, []);

  const handlePromptBottomSheetClose = useCallback(() => {
    setActivePrompt(undefined);
    promptOptionsSheetRef.current?.close();
  }, []);
  useEffect(() => {
    /**
     * This delay is added before showing bottom sheet because some time
     * is required for the assignment in react state to reflect in the UI.
     */
    let delayMs = 300;
    if (Platform.OS === "android") {
      delayMs = 500;
    }
    if (activePrompt) {
      const timeout = setTimeout(() => {
        promptOptionsSheetRef.current?.expand();
      }, delayMs);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activePrompt]);

  return (
    <Screen>
      <ScrollView>
        <View className="flex flex-1 px-4 justify-between">
          <View>
            <Text className="text-white font-sans text-lg">
              {route.params.quest.title}
            </Text>
            <Text className="text-white opacity-60 text-base font-sans my-2">
              {route.params.quest.description}
            </Text>

            {route.params.quest.organizerName && (
              <Text className="text-white opacity-60 text-base font-sans my-2">
                Organized by {route.params.quest.organizerName}
              </Text>
            )}

            <View className="mt-5">
              {/* TODO: display the list of prompts that are required for the quest */}
              <Text className="text-white font-sans text-lg px-5">Prompts</Text>
              {route.params.quest.prompts?.map((prompt) => (
                <View key={Math.random()} className="my-2">
                  <PromptDetails
                    prompt={prompt}
                    variant={
                      addedQuestPrompts.find((p) => {
                        return p.promptText === prompt.promptText;
                      })
                        ? "detail"
                        : "add"
                    }
                    displayFrequency={
                      !!addedQuestPrompts
                        .map((p) => p.promptText)
                        .includes(prompt.promptText)
                    }
                    onClick={() => {
                      // if prompt is saved, show detail
                      if (
                        addedQuestPrompts.find((p) => {
                          return p.promptText === prompt.promptText;
                        })
                      ) {
                        // TODO: prompt actions:handlePromptExpandSheet(prompt);
                        // handle prompt bottom sheet
                      } else {
                        // necessary so that quest_prompts get linked
                        prompt.additionalMeta["questId"] =
                          route.params.quest.guid;
                        navigation.navigate("PromptNavigator", {
                          screen: "EditPrompt",
                          params: {
                            prompt,
                            type: "add",
                          },
                        });
                      }
                    }}
                  />
                </View>
              ))}
            </View>

            <HealthCard />
          </View>

          {/* if the user is subscribed, show 'View Quest' */}
          {/* display the procedural steps that happen after they join */}
          {/* sync data, leave quest etc.. */}
          {/*  */}

          {/* if the user is not subscribed, show 'Get Started' */}
          {isSubscribed === false && (
            <Button
              title="Get Started"
              fullWidth
              className="mb-5"
              onPress={addUserToQuest}
            />
          )}
        </View>
      </ScrollView>

      <Portal>
        {activePrompt && (
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheetRef}
            promptId={activePrompt?.uuid!}
            onBottomSheetClose={handlePromptBottomSheetClose}
            defaultPrompt={activePrompt}
          />
        )}
      </Portal>
    </Screen>
  );
}
