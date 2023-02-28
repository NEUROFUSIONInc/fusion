import React from "react";
import { StyleSheet, Text, View, Button, Alert, FlatList } from "react-native";
import { PromptContext, deletePrompt } from "../utils.js";

export function HomeScreen({ navigation, route }) {
  const { savedPrompts, setSavedPrompts } = React.useContext(PromptContext);

  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 15 }}>
          Track your daily activities by answering personalized prompts that
          enable you to observe your behavioral patterns over time.
        </Text>
      </View>

      {/* Events div  */}
      <Text style={{ fontWeight: "bold", fontSize: "30" }}>Prompts</Text>
      {/* if there were events list them */}
      {savedPrompts && savedPrompts?.length > 0 ? (
        <FlatList
          data={savedPrompts}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text>Prompt Text: {item.promptText}</Text>
                <Text>Response Type: {item.responseType}</Text>
                <Text>
                  Frequency: {item.notificationFrequency.value}{" "}
                  {item.notificationFrequency.unit}
                </Text>
              </View>

              {/* Edit/Delete/View Prompt responses */}
              <View>
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
    // justifyContent: "center",
    padding: 10,
  },
  input: {
    height: 50,
    // margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    lineHeight: 25,
  },
  formSection: {
    width: "100%",
    padding: 10,
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  frequencyValueInput: {
    width: "20%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  frequencyDropDown: {
    width: "80%",
  },
  item: {
    // padding: 10,
    // fontSize: 18,
    margin: 10,
  },
});
