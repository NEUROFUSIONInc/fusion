import React from "react";

import { FlatList, StyleSheet, Text, View } from "react-native";
import { FusionChart } from "../components/chart.js";
import { getEventsForPrompt } from "../utils.js";
import dayjs from "dayjs";

export function ResponsesScreen({ navigation, route }) {
  const { prompt } = route.params;

  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    // fetch the responses for this prompt
    (async () => {
      const res = await getEventsForPrompt(prompt);

      // sort events
      res.sort((a, b) => {
        return a.startTimestamp - b.startTimestamp;
      });

      setEvents(res);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>{prompt.promptText}</Text>
      <Text>Responses</Text>

      {events && events.length > 0 ? (
        prompt.responseType === "yesno" ? (
          <FusionChart data={events} prompt={prompt} />
        ) : (
          // list the events
          <FlatList
            data={events}
            renderItem={({ item }) => (
              <View key={Math.random()}>
                <Text>{dayjs(item.startTimestamp).toString()}</Text>
                <Text>{item.event.value}</Text>
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
