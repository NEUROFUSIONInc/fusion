import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import Toast from "react-native-toast-message";

import {
  OnboardingResponse,
  Prompt,
  PromptNotifyCondition,
  PromptNotifyOperator,
  PromptOptionKey,
  Quest,
} from "~/@types";
import {
  Button,
  PromptDetails,
  PromptOptionsSheet,
  QuestOnboardingSheet,
  Screen,
} from "~/components";
import { AccountContext } from "~/contexts";
import { useCreatePrompt, useCreateQuest, usePromptsQuery } from "~/hooks";
import { RouteProp } from "~/navigation";
import { promptService } from "~/services/prompt.service";
import { questService } from "~/services/quest.service";
import { appInsights, getApiService } from "~/utils";

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);

  const route = useRoute<RouteProp<"QuestDetailScreen">>();

  const { mutateAsync: createQuest } = useCreateQuest();
  const { mutateAsync: createPrompt } = useCreatePrompt(false);
  const { data: savedPrompts, isLoading: savedPromptsLoading } =
    usePromptsQuery();

  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [joiningQuest, setJoiningQuest] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [questIsSavedLocally, setQuestIsSavedLocally] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);
  const [onboardingResponses, setOnboardingResponses] = React.useState<
    OnboardingResponse[]
  >([]);
  const [quest, setQuest] = React.useState<Quest | undefined>(
    route.params.quest
  );

  const [questPrompts, setQuestPrompts] = React.useState<Prompt[]>([]);
  React.useEffect(() => {
    if (savedPrompts) {
      setQuestPrompts(
        savedPrompts.filter(
          (prompt) => prompt.additionalMeta?.questId === quest?.guid
        )
      );
    }
  }, [savedPrompts]);

  /**
   * Check if the quest is saved locally
   */
  React.useEffect(() => {
    questService
      .getSingleQuestFromLocal(route.params.quest.guid)
      .then((quest) => {
        if (quest) {
          setQuestIsSavedLocally(true);
        } else {
          setQuestIsSavedLocally(false);
        }
      });
  }, []);

  /**
   * Log page view, parse quest prompts, set active quest
   */
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
      accountContext?.setUserPreferences({
        ...accountContext?.userPreferences,
        activeQuest: quest,
      });
    }

    getQuestSubscriptionStatus();
  }, [quest]);

  /**
   * If the user is subscribed, fetch quest data from remote and push to remote storage
   */
  useEffect(() => {
    if (isSubscribed) {
      (async () => {
        await updateQuest();
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

  /**
   * When onboarding is complete, trigger addUserToQuest
   */
  useEffect(() => {
    if (onboardingComplete) {
      (async () => {
        await addUserToQuest();
      })();
    }
  }, [onboardingComplete]);

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
     * This runs after user completes onboarding (include consent)
     * - makes api call for a user to join a quest
     * 3. Save prompts in db - if they exist (rec) 1 prompt
     * 4. Fetch health data - if required
     * 5. Show success toast
     */
    try {
      setJoiningQuest(true);
      // remote call to add user to quest
      const apiService = await getApiService();
      if (apiService === null) {
        return;
      }
      const addUserResponse = await apiService.post(`/quest/join`, {
        questId: route.params.quest.guid,
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

        setQuestIsSavedLocally(true);

        // save prompts locally
        await handleQuestPromptOnboarding(
          route.params.quest.prompts!,
          onboardingResponses,
          quest?.guid!
        );

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

  const handleQuestPromptOnboarding = async (
    prompts: Prompt[],
    onboardingResponses: OnboardingResponse[],
    questGuid: string
  ) => {
    if (prompts) {
      const res = await Promise.all(
        prompts.map(async (prompt) => {
          // link prompt to quest
          prompt.additionalMeta["questId"] = questGuid;

          const notifyConditions = prompt.additionalMeta["notifyConditions"];

          let shouldSavePrompt = true;

          // If we have multiple conditions, check all of them
          if (notifyConditions && notifyConditions.length > 0) {
            for (const condition of notifyConditions) {
              if (condition.sourceType === "onboardingQuestion") {
                const response = onboardingResponses.find(
                  (r) => r.guid === condition.sourceId
                );
                if (response) {
                  const conditionMet = evaluatePromptCondition(
                    response.responseValue,
                    condition
                  );
                  if (!conditionMet) {
                    shouldSavePrompt = false;
                    break;
                  }
                }
              }
            }
          }

          if (!shouldSavePrompt) {
            return false;
          }

          // Set notification status based on conditions
          if (
            notifyConditions &&
            notifyConditions.some((c) => c.sourceType === "prompt")
          ) {
            prompt.additionalMeta["isNotificationActive"] = false;
          }

          const promptRes = await createPrompt(prompt);
          return promptRes;
        })
      );

      if (res.includes(undefined)) {
        throw new Error("Failed to save prompts locally");
      }
    }
  };

  const evaluatePromptCondition = (
    responseValue: string,
    condition: PromptNotifyCondition
  ): boolean => {
    const sourceValue = responseValue.toLowerCase();
    const targetValue = condition.value.toLowerCase();

    switch (condition.operator) {
      case PromptNotifyOperator.equals:
        return sourceValue === targetValue;
      case PromptNotifyOperator.not_equals:
        return sourceValue !== targetValue;
      case PromptNotifyOperator.greater_than:
        return Number(sourceValue) > Number(targetValue);
      case PromptNotifyOperator.less_than:
        return Number(sourceValue) < Number(targetValue);
      default:
        return true;
    }
  };

  const updateQuest = async () => {
    const apiService = await getApiService();
    if (!apiService || !quest?.guid) return;

    const latestQuestDetail = await fetchLatestQuestDetail(
      apiService,
      quest.guid
    );
    if (!latestQuestDetail) return;
    setQuest(latestQuestDetail);

    const hasChanged = await questService.hasQuestChanged(
      quest,
      latestQuestDetail
    );
    if (!hasChanged) {
      console.log("Quest has not changed");
      return;
    }

    console.log("Quest has changed");
    await createQuest(latestQuestDetail);

    const onboardingResponses = await fetchOnboardingResponses(
      apiService,
      quest.guid
    );

    if (latestQuestDetail.prompts) {
      await updateQuestPrompts(
        latestQuestDetail.prompts,
        onboardingResponses,
        quest.guid
      );
    }
  };

  const fetchLatestQuestDetail = async (apiService: any, questId: string) => {
    const res = await apiService.get(`/quest/detail`, {
      params: { questId },
    });

    if (res.status >= 200 && res.status < 300) {
      const questDetail = res.data.quest;
      if (questDetail) {
        questDetail.prompts = JSON.parse(questDetail.config ?? "{}")?.prompts;
        return questDetail;
      }
    }
    return null;
  };

  const fetchOnboardingResponses = async (apiService: any, questId: string) => {
    const res = await apiService.get(`/quest/datasets`, {
      params: {
        questId,
        type: "onboarding_responses",
        singleUser: true,
      },
    });

    if (res.status >= 200 && res.status < 300) {
      const responses = res.data.userQuestDatasets[0]
        .value as OnboardingResponse[];
      console.log("onboardingResponses", responses);
      return responses;
    }
    return [];
  };

  const updateQuestPrompts = async (
    newPrompts: any[],
    onboardingResponses: OnboardingResponse[],
    questId: string
  ) => {
    // Delete old prompts
    await Promise.all(
      questPrompts.map((prompt) =>
        promptService.deletePrompt(prompt.uuid, false)
      )
    );

    // Save new prompts
    await handleQuestPromptOnboarding(newPrompts, onboardingResponses, questId);
  };

  /** Prompt Sheet Functions */
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
  /** End Prompt Sheet Functions */

  const questOnboardingBottomSheetRef = React.useRef<RNBottomSheet>(null);
  const handleExpandQuestOnboardingSheet = React.useCallback(
    () => questOnboardingBottomSheetRef.current?.expand(),
    []
  );

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

            {/* TODO: only show based on healthDataConfig */}
            {/* <HealthCard /> */}

            <View className="mt-5">
              {((!savedPromptsLoading && questPrompts.length > 0) ||
                (quest?.prompts && quest.prompts.length > 0)) && (
                <>
                  {["Morning", "Afternoon", "Evening"].map((timeOfDay) => {
                    const getTimeRange = (time: string) => {
                      switch (time) {
                        case "Morning":
                          return (hour: number) => hour >= 5 && hour < 12;
                        case "Afternoon":
                          return (hour: number) => hour >= 12 && hour < 17;
                        case "Evening":
                          return (hour: number) => hour >= 17 || hour < 5;
                        default:
                          return () => false;
                      }
                    };

                    const timeRange = getTimeRange(timeOfDay);
                    const prompts =
                      questPrompts.length > 0 ? questPrompts : quest?.prompts;
                    const promptsInRange = prompts?.filter((prompt) => {
                      const startHour = parseInt(
                        prompt.notificationConfig_startTime.split(":")[0],
                        10
                      );
                      return timeRange(startHour);
                    });

                    if (!promptsInRange || promptsInRange.length === 0)
                      return null;

                    return (
                      <View key={timeOfDay}>
                        <Text className="text-white font-sans text-base px-5 mt-4 mb-2">
                          {timeOfDay}
                        </Text>
                        {promptsInRange.map((prompt) => (
                          <View key={prompt.uuid} className="my-2">
                            <PromptDetails
                              prompt={prompt}
                              variant="detail"
                              displayFrequency
                              onClick={
                                questPrompts.length > 0
                                  ? () => handlePromptExpandSheet(prompt)
                                  : undefined
                              }
                            />
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* if the user is not subscribed, show 'Get Started' */}
      {((isLoading === false && isSubscribed === false) ||
        questIsSavedLocally === false) && (
        <View className="mt-5">
          <Button
            title="Complete Onboarding"
            fullWidth
            className="mb-5"
            onPress={handleExpandQuestOnboardingSheet}
            loading={joiningQuest}
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
            optionsList={
              activePrompt.additionalMeta.notifyConditions?.some(
                (condition) => condition.sourceType === "prompt"
              )
                ? [PromptOptionKey.record, PromptOptionKey.previous]
                : [
                    PromptOptionKey.record,
                    PromptOptionKey.previous,
                    PromptOptionKey.edit,
                  ]
            }
          />
        )}

        <QuestOnboardingSheet
          bottomSheetRef={questOnboardingBottomSheetRef}
          quest={accountContext?.userPreferences?.activeQuest!}
          callback={(onboardingResponses: OnboardingResponse[]) => {
            setOnboardingResponses(onboardingResponses);
            setOnboardingComplete(true);
          }}
        />
      </Portal>
    </Screen>
  );
}
