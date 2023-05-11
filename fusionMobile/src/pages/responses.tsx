import React from "react";

import { FlatList, StyleSheet, Text, View } from "react-native";
import { FusionChart } from "../components/chart.js";
import dayjs from "dayjs";
import {
  getPromptResponses,
  updateTimestampToMs,
  maskPromptId,
  appInsights,
} from "~/utils";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "~/navigation/types.js";
import { PromptResponse } from "~/@types/index.js";

export function ResponsesScreen() {
  const route = useRoute<RouteProp<"ViewResponses">>();
  const { prompt } = route.params;

  const [promptResponses, setPromptResponses] = React.useState<
    PromptResponse[]
  >([]);

  React.useEffect(() => {
    // fetch the responses for this prompt
    (async () => {
      const res = await getPromptResponses(prompt);

      // sort events
      res.sort((a, b) => {
        return a.triggerTimestamp - b.triggerTimestamp;
      });

      setPromptResponses(res);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      appInsights.trackPageView({
        name: "Prompt Responses",
        properties: {
          identifier: await maskPromptId(prompt.uuid),
          response_count: promptResponses?.length,
        },
      });
    })();
  }, [prompt, promptResponses]);

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>{prompt.promptText}</Text>

      {promptResponses && promptResponses.length > 0 ? (
        prompt.responseType === "yesno" ? (
          <FusionChart data={promptResponses} prompt={prompt} />
        ) : (
          // list the events
          <FlatList
            data={promptResponses}
            renderItem={({ item }) => (
              <View key={Math.random()}>
                <Text>
                  {dayjs(updateTimestampToMs(item.triggerTimestamp)).toString()}
                </Text>
                <Text>{item.value}</Text>
              </View>
            )}
          />
        )
      ) : (
        <Text>No responses yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 10,
  },
  promptText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
