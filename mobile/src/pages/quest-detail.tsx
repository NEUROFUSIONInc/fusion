import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

import { Button, PromptDetails, Screen } from "~/components";
import { AccountContext } from "~/contexts";
import { RouteProp } from "~/navigation";
import { appInsights } from "~/utils";

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

    // TODO: get user subscription status
  }, []);

  return (
    <Screen>
      <View className="flex flex-1 px-4 justify-between">
        <View>
          <Text className="text-white font-sans text-lg">
            {route.params.quest.title}
          </Text>
          <Text className="text-white opacity-60 text-base font-sans my-2">
            {route.params.quest.description}
          </Text>

          <View className="mt-5">
            {/* TODO: display the list of prompts that are required for the quest */}
            {route.params.quest.prompts?.map((prompt) => (
              <View key={Math.random()} className="my-2">
                <PromptDetails prompt={prompt} />
              </View>
            ))}
          </View>
        </View>
        {/* TODO: show Organized by  */}

        {/*  */}

        {/* if the user is not subscribed, show 'Get Started' */}
        <Button
          title="Get Started"
          fullWidth
          className="mb-5"
          onPress={() => {
            // display the bottom sheet with
            // consent - I agree to participate in this quest
            //  I agree to share data I collect with the quest organizer
          }}
        />
      </View>
    </Screen>
  );
}
