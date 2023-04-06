import React from "react";
import { StyleSheet, Text, View, Button, Alert, FlatList } from "react-native";
import { PromptContext, deletePrompt, convertTime } from "../utils.js";

export function HomeScreen({ navigation, route }) {
  const { savedPrompts, setSavedPrompts } = React.useContext(PromptContext);

  const dayLabels = {
    monday: "Mon",
    tuesday: "Tues",
    wednesday: "Wed",
    thursday: "Thur",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 15 }}>
          Track your behavior & activities by answering prompts that are
          tailored to you.{"\n\n"}Your prompts & responses are stored only on
          your device.
        </Text>
      </View>

      {/* Events div  */}
      <Text style={{ fontWeight: "bold", fontSize: 30, marginTop: 10 }}>
        Prompts
      </Text>
      {/* if there were events list them */}
      {savedPrompts && savedPrompts?.length > 0 ? (
        <FlatList
          data={savedPrompts}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.promptText}>{item.promptText}</Text>
                <Text>
                  You'll be prompted {item.notificationConfig_countPerDay} times
                  to respond with {item.responseType}
                  {"\n"}
                  Between {convertTime(
                    item.notificationConfig_startTime
                  )} and {convertTime(item.notificationConfig_endTime)}
                </Text>
              </View>

              {/* Edit/Delete/View Prompt responses */}
              <View style={styles.promptActions}>
                <Button
                  title="Edit"
                  onPress={() =>
                    navigation.navigate("AuthorPrompt", {
                      prompt: item,
                    })
                  }
                />
                <Button
                  title="Delete"
                  onPress={() => {
                    Alert.alert(
                      "Delete Prompt",
                      "Are you sure you want to delete this prompt?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "OK",
                          onPress: async () => {
                            const res = await deletePrompt(item.uuid);
                            if (res) {
                              setSavedPrompts(res);
                            }
                          },
                        },
                      ]
                    );
                  }}
                />
                <Button
                  title="View Responses"
                  onPress={() =>
                    navigation.navigate("ViewResponses", {
                      prompt: item,
                    })
                  }
                />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.uuid}
          deleteItem={() => console.log("delete")}
        />
      ) : (
        <Text>None configured yet...</Text>
      )}

      <View>
        <Button
          title="Add new prompt"
          onPress={() => navigation.navigate("AuthorPrompt")}
        />
      </View>
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
  promptActions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    margin: 10,
  },
});
