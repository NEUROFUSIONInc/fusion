import { RouteProp, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { Text } from "react-native";

import { CalendarPicker } from "~/components";
import { Screen } from "~/components/screen";
import { InsightsStackParamList } from "~/navigation/insights-navigator";

export function PromptResponsesScreen() {
  // fetch the prompt details
  const route =
    useRoute<RouteProp<InsightsStackParamList, "PromptResponsesPage">>();
  const routePrompt = route.params.prompt;

  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs>(
    dayjs(route.params.selectedDate)
  );

  return (
    <Screen>
      <CalendarPicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <Text className="font-sans-bold text-base text-white">
        {routePrompt.promptText}
      </Text>

      <Text className="font-sans text-white text-center">
        Prompt Response History
      </Text>
    </Screen>
  );
}
