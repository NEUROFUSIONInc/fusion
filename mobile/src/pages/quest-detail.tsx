import { useRoute } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { black } from "tailwindcss/colors";

import { Button, ChevronRight, PromptDetails, Screen } from "~/components";
import { AccountContext } from "~/contexts";
import { RouteProp } from "~/navigation";
import {
  appInsights,
  buildHealthDataset,
  connectAppleHealth,
  FusionHealthDataset,
} from "~/utils";

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);

  const route = useRoute<RouteProp<"QuestDetailScreen">>();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "QuestDetail",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    (async () => {
      await getQuestSubscriptionStatus();
    })();
  }, []);

  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const getQuestSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${Constants.expoConfig?.extra?.fusionBackendUrl}/api/quest/userSubscription`,
        {
          params: {
            questId: route.params.quest.guid,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accountContext?.userApiToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Subscription status", response.data);
        setIsSubscribed(true);
      } else {
        console.log(response.status);
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
      const requestUrl = `${Constants.expoConfig?.extra?.fusionBackendUrl}/api/quest/join`;
      console.log("requestUrl", requestUrl);
      console.log("questGuid", route.params.quest.guid);
      const addUserResponse = await axios.post(
        `${Constants.expoConfig?.extra?.fusionBackendUrl}/api/quest/join`,
        {
          questId: route.params.quest.guid,
          data: {
            consentClaims: ["I agree to participate in this quest"],
            displayName: "Test User",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accountContext?.userApiToken}`,
          },
        }
      );

      if (addUserResponse.status >= 200 && addUserResponse.status < 300) {
        console.log("User added to quest successfully");
        console.log(addUserResponse.data);

        setIsSubscribed(true);

        appInsights.trackEvent({
          name: "fusion_quest_join",
          properties: {
            userNpub: accountContext?.userNpub,
            questGuid: route.params.quest.guid,
            // todo: add consent claims
          },
        });

        // todo: show success toast
        Toast.show({
          type: "success",
          text1: "Quest Started",
          text2: "You have successfully joined the quest!",
        });

        // TODO: save prompts locations

        // TODO: fetch health data
        // await connectAppleHealth();
      } else {
        console.log(addUserResponse.status);
      }
    } catch (error) {
      console.error("Failed to add user to quest", error);
    }
  };

  const saveAndConfigureQuestPrompts = async () => {
    // add entry to quest, quest_prompts
    // save prompts in db & configure them
    // fetch health data
  };

  const [healthDataset, setHealthDataset] = React.useState<
    FusionHealthDataset[]
  >([]);

  const syncHealthData = async () => {
    // reuse functions from settings page
    await connectAppleHealth();

    // build the health dataset
    try {
      const res = await buildHealthDataset(
        dayjs().startOf("day").subtract(5, "days"),
        dayjs()
      );

      if (res) {
        console.log("health data", res);
        setHealthDataset(res);
      }
    } catch (error) {
      console.error("Failed to sync health data", error);
    }
  };

  const secondsToHms = (d: number) => {
    if (!d) return "-- hrs -- mins";
    const hours = Math.floor(d / 3600);
    const minutes = Math.floor((d % 3600) / 60);
    return `${hours} hrs ${minutes} mins`;
  };

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
              <Text className="text-white font-sans text-lg">Prompts</Text>
              {route.params.quest.prompts?.map((prompt) => (
                <View key={Math.random()} className="my-2">
                  <PromptDetails prompt={prompt} />
                </View>
              ))}
            </View>
            {isSubscribed === true && (
              <View className="mt-5">
                <Text className="text-white font-sans text-lg">Health</Text>

                {/* display the steps data */}
                <View className="flex flex-row w-full items-center justify-between rounded-md mt-2 py-5 px-4 bg-secondary-900 active:opacity-90">
                  <Text className="font-sans flex flex-wrap text-white text-base mr-2">
                    Steps
                  </Text>
                  <Text className="font-sans text-base text-white opacity-60">
                    {healthDataset.find(
                      (data) => data.date === dayjs().format("YYYY-MM-DD")
                    )?.stepSummary.totalSteps ?? "----"}{" "}
                    steps
                  </Text>
                </View>

                {/* display the sleep data */}
                <View className="flex flex-row w-full items-center justify-between rounded-md mt-2 py-5 px-4 bg-secondary-900 active:opacity-90">
                  <Text className="font-sans flex flex-wrap text-white text-base mr-2">
                    Sleep
                  </Text>
                  <Text className="font-sans text-base text-white opacity-60">
                    {secondsToHms(
                      healthDataset.find(
                        (data) => data.date === dayjs().format("YYYY-MM-DD")
                      )?.sleepSummary.duration!
                    ) ?? "-- hrs -- mins"}
                  </Text>
                </View>

                {/* sync or display health data */}
                <Button
                  title="Sync your sleep, activity & heart rate"
                  fullWidth
                  onPress={syncHealthData}
                  className="flex justify-between mt-2"
                  rightIcon={<ChevronRight color={black} />}
                />
              </View>
            )}
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
    </Screen>
  );
}
