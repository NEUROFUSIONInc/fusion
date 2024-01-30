import { RouteProp, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CalendarPicker, ResponseTextItem } from "~/components";
import { Screen } from "~/components/screen";
import { InsightContext } from "~/contexts";
import { InsightsStackParamList } from "~/navigation/insights-navigator";
import { promptService } from "~/services";

export function PromptResponsesScreen() {
  // fetch the prompt details
  const route =
    useRoute<RouteProp<InsightsStackParamList, "PromptResponsesPage">>();
  const routePrompt = route.params.prompt;

  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs>(
    dayjs(route.params.selectedDate)
  );

  const insightContext = React.useContext(InsightContext);

  const [promptResponses, setPromptResponses] = React.useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const res = await promptService.getPromptResponses(
        routePrompt.uuid,
        selectedDate.startOf(insightContext!.insightPeriod).valueOf(),
        selectedDate.endOf(insightContext!.insightPeriod).valueOf()
      );

      if (res) {
        setPromptResponses(res);
      }
    })();
  }, [selectedDate]);

  return (
    <Screen>
      <CalendarPicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <Text className="font-sans-bold text-xl text-white text-center">
        {routePrompt.promptText}
      </Text>
      <Text className="font-sans text-white text-center opacity-60">
        Past Responses
      </Text>

      <ScrollView className="mt-3 p-3" showsVerticalScrollIndicator={false}>
        {promptResponses?.map((response) => {
          return (
            <ResponseTextItem
              key={Math.random()}
              timestamp={dayjs(response.responseTimestamp)}
              textValue={response.value}
              isEditable
              promptResponse={response}
            />
          );
        })}
        {promptResponses.length === 0 && (
          <Text className="font-sans text-white text-center opacity-60">
            No responses for this time period.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
