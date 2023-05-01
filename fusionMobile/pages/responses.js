import React from "react";

import { FlatList, StyleSheet, Text, View } from "react-native";
import { FusionChart } from "../components/chart.js";
import { getPromptResponses, updateTimestampToMs } from "../utils.js";
import dayjs from "dayjs";
import appInsights from "../utils/appInsights.js";

export function ResponsesScreen({ navigation, route }) {
  const { prompt } = route.params;

  const [promptResponses, setPromptResponses] = React.useState([]);

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

    appInsights.trackPageView({ name: "Responses", properties: {} });
  }, []);

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
