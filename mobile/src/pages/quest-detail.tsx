import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import Toast from "react-native-toast-message";

import { Prompt, Quest } from "~/@types";
import {
  Button,
  PromptDetails,
  PromptOptionsSheet,
  Screen,
} from "~/components";
import { HealthCard } from "~/components/health-details";
import { AccountContext } from "~/contexts";
import { useCreatePrompt, useCreateQuest } from "~/hooks";
import { RouteProp } from "~/navigation";
import { promptService } from "~/services";
import { questService } from "~/services/quest.service";
import { appInsights, getApiService } from "~/utils";

/**
 *
 * TODO:
 */

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);

  const route = useRoute<RouteProp<"QuestDetailScreen">>();

  const [, setAddQuestPrompts] = React.useState<Prompt[]>([]);

  const { mutateAsync: createQuest } = useCreateQuest();

  const { mutateAsync: createPrompt } = useCreatePrompt();

  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [joiningQuest, setJoiningQuest] = React.useState(false);

  /**
   * Fetch quest details from remote server and updates the data cache after a period of time
   */
  const handleFetchQuestFromRemote = async () => {
    let fusionBackendUrl;
    if (Constants.expoConfig?.extra) {
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }
    try {
      const response = await axios.get(`${fusionBackendUrl}/api/quest/detail`, {
        params: { questId: route.params.quest.guid },
        headers: {
          Authorization: `Bearer ${accountContext?.userApiToken}`,
        },
      });
      const quest = response?.data?.quest as Quest;
      return questService.saveQuest(quest);
    } catch (error) {
      console.log("error --->", error);
    }
  };

  /**
   * Fetch the prompts user has saved for this quest
   */
  const handleFetchQuestPrompts = async () => {
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
  };

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "QuestDetail",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    handleFetchQuestPrompts();
  }, []);

  React.useEffect(() => {
    handleFetchQuestFromRemote();
  }, []);

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
      setJoiningQuest(true);
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
        const res = await createQuest(route.params.quest);

        if (!res) {
          // show error toast
          throw new Error("Failed to save quest locally");
        }

        // save prompts locally
        if (route.params.quest.prompts) {
          const res = await Promise.all(
            route.params.quest.prompts.map(async (prompt) => {
              // link prompt to quest
              prompt.additionalMeta["questId"] = route.params.quest.guid;
              const promptRes = await createPrompt(prompt);
              return promptRes;
            })
          );

          if (res.includes(undefined)) {
            throw new Error("Failed to save prompts locally");
          }
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
    } finally {
      setJoiningQuest(false);
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
            <HealthCard />
            <View className="mt-5">
              {/* TODO: display the list of prompts that are required for the quest */}
              <Text className="text-white font-sans text-lg px-5">Prompts</Text>
              {route.params.quest.prompts?.map((prompt) => (
                <View key={Math.random()} className="my-2">
                  <PromptDetails
                    prompt={prompt}
                    variant="detail"
                    displayFrequency
                    onClick={() => {
                      if (isSubscribed !== false) {
                        handlePromptExpandSheet(prompt);
                        // handle prompt bottom sheet
                      }
                    }}
                  />
                </View>
              ))}
            </View>
            {/* Leadewrboard */}
            {/* <View className="mt-5">
              <Text className="text-white font-sans text-lg px-5">
                Leaderboard
              </Text>
            </View> */}
          </View>

          {/* sync data, leave quest etc.. */}
          {/*  */}
        </View>
      </ScrollView>

      {/* if the user is not subscribed, show 'Get Started' */}
      {isSubscribed === false && (
        <View className="mt-5">
          <Button
            title="Complete Onboarding"
            fullWidth
            className="mb-5"
            onPress={addUserToQuest}
            loading={joiningQuest}
          />
        </View>
      )}

      {isSubscribed && (
        <View className="mt-5 space-y-2">
          <Button
            title="View Leaderboard"
            fullWidth
            className="mb-5"
            onPress={async () => {
              // push data to remote (this storage)
              const pushStatus = await questService.uploadQuestDataset(
                route.params.quest.guid
              );

              // send the user to the quest page
              await WebBrowser.openBrowserAsync(
                `https://usefusion.ai/quest/${route.params.quest.guid}`
              );
            }}
          />
        </View>
      )}

      <Portal>
        {activePrompt && (
          <PromptOptionsSheet
            promptOptionsSheetRef={promptOptionsSheetRef}
            promptId={activePrompt?.uuid!}
            onBottomSheetClose={handlePromptBottomSheetClose}
            defaultPrompt={activePrompt}
            allowEdit={false}
          />
        )}
      </Portal>
    </Screen>
  );
}
