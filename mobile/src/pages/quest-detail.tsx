import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useRoute } from "@react-navigation/native";
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
import { questService } from "~/services/quest.service";
import { appInsights, getApiService } from "~/utils";

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);

  const route = useRoute<RouteProp<"QuestDetailScreen">>();

  const { mutateAsync: createQuest } = useCreateQuest();
  const { mutateAsync: createPrompt } = useCreatePrompt();

  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [joiningQuest, setJoiningQuest] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [quest, setQuest] = React.useState<Quest | undefined>(
    route.params.quest
  );

  /**
   * Fetch quest details from remote server and
   * updates the data cache after a period of time
   */
  const handleFetchQuestFromRemote = async () => {
    try {
      const apiService = await getApiService();
      if (apiService === null) {
        console.log("apiService is null");
        return;
      }
      const response = await apiService.get(`/quest/detail`, {
        params: { questId: route.params.quest.guid },
      });
      const updatedQuest = {
        ...response?.data?.quest,
        prompts: JSON.parse(response?.data?.quest?.config)?.prompts,
      } as Quest;

      if (
        quest?.title !== updatedQuest.title ||
        quest?.description !== updatedQuest.description ||
        quest?.config !== updatedQuest.config
      ) {
        setQuest(updatedQuest);
        // only save if the user is subscribed
        if (isSubscribed) {
          await questService.saveQuest(updatedQuest);
        }
      }
    } catch (error) {
      console.log("error --->", error);
    }
  };

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "QuestDetail",
      properties: {
        questGuid: quest?.guid,
        userNpub: accountContext?.userNpub,
      },
    });

    if (quest) {
      quest.prompts = JSON.parse(quest?.config ?? "{}")?.prompts;
    }

    getQuestSubscriptionStatus();
  }, [quest]);

  useEffect(() => {
    if (isSubscribed) {
      (async () => {
        await handleFetchQuestFromRemote();
        await pushQuestData();
      })();
    }
  }, [isSubscribed]);

  /**
   * Push quest data to remote storage if the user is subscribed
   */
  const pushQuestData = async () => {
    if (quest?.guid && isSubscribed) {
      await questService.uploadQuestDataset(quest.guid);
    }
  };

  const getQuestSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const questSubscriptionStatus =
        await questService.fetchRemoteSubscriptionStatus(
          route.params.quest.guid
        );
      if (questSubscriptionStatus) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Failed to get quest subscription status", error);
    } finally {
      setIsLoading(false);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-1 px-4 justify-between">
          <View>
            <Text className="text-white font-sans text-lg">{quest?.title}</Text>
            <Text className="text-white opacity-60 text-base font-sans my-2">
              {quest?.description}
            </Text>
            {quest?.organizerName && (
              <Text className="text-white opacity-60 text-base font-sans my-2">
                Organized by {quest.organizerName}
              </Text>
            )}
            <HealthCard />
            <View className="mt-5">
              <Text className="text-white font-sans text-lg px-5">Prompts</Text>
              {quest?.prompts &&
                quest.prompts.length > 0 &&
                quest.prompts.map((prompt) => (
                  <View key={Math.random()} className="my-2">
                    <PromptDetails
                      prompt={prompt}
                      variant="detail"
                      displayFrequency
                    />
                  </View>
                ))}
            </View>
          </View>

          {/* sync data, leave quest etc.. */}
          {/*  */}
        </View>
      </ScrollView>

      {/* if the user is not subscribed, show 'Get Started' */}
      {isLoading === false && isSubscribed === false && (
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

      {isLoading === false && isSubscribed && (
        <View className="mt-5 space-y-2">
          <Button
            title="View Leaderboard"
            fullWidth
            className="mb-5"
            onPress={async () => {
              // push data to remote (this storage)
              if (quest?.guid) {
                await questService.uploadQuestDataset(quest.guid);
              }

              // send the user to the quest page
              await WebBrowser.openBrowserAsync(
                `https://usefusion.ai/quest/${quest?.guid}`
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
