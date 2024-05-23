import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import Toast from "react-native-toast-message";

import { Button, PromptDetails, Screen } from "~/components";
import { HealthCard } from "~/components/health-details";
import { AccountContext } from "~/contexts";
import { RouteProp } from "~/navigation";
import { questService } from "~/services/quest.service";
import { appInsights, getApiService } from "~/utils";

export function QuestDetailScreen() {
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();

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
      const apiService = await getApiService();
      if (apiService === null) {
        throw new Error("Failed to get api service");
      }

      const response = await apiService.get(`/quest/userSubscription`, {
        params: {
          questId: route.params.quest.guid,
        },
      });

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
      // save quest locally
      const res = await questService.saveQuest(route.params.quest);

      if (!res) {
        // show error toast
        return;
      }

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
      console.error("Failed to add user to quest", error);
    }
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
              <Text className="text-white font-sans text-lg px-5">Prompts</Text>
              {route.params.quest.prompts?.map((prompt) => (
                <View key={Math.random()} className="my-2">
                  <PromptDetails
                    prompt={prompt}
                    variant="add"
                    displayFrequency={false}
                    onClick={() =>
                      navigation.navigate("PromptNavigator", {
                        screen: "EditPrompt",
                        params: {
                          prompt,
                          type: "add",
                        },
                      })
                    }
                  />
                </View>
              ))}
            </View>
            {isSubscribed === true && <HealthCard />}
          </View>

          {/* if the user is subscribed, show 'View Quest' */}
          {/* display the procedural steps that happen after they join */}
          {/* sync data, leave quest etc.. */}
          {/*  */}

          {/* if the user is not subscribed, show 'Get Started' */}
          {/* {isSubscribed === false && ( */}
          <Button
            title="Get Started"
            fullWidth
            className="mb-5"
            onPress={addUserToQuest}
          />
          {/* )} */}
        </View>
      </ScrollView>
    </Screen>
  );
}
