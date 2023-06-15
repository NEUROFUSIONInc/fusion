import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, Text, View, Button, Alert, FlatList } from "react-native";

import { usePrompts } from "~/hooks";
import { promptService } from "~/services";
import { convertTime, maskPromptId, appInsights } from "~/utils";

export function HomeScreen() {
  const navigation = useNavigation();
  const { savedPrompts, setSavedPrompts } = usePrompts();

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Home",
      properties: {
        prompt_count: savedPrompts?.length,
      },
    });
  }, [savedPrompts]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 15 }}>
          Uncover shifts in your behavior and activities through personalized
          prompts, designed just for you.{"\n\n"}Your prompts and responses are
          stored only on your device.
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
                  title="Log"
                  onPress={() =>
                    navigation.navigate("PromptEntry", {
                      promptUuid: item.uuid,
                      triggerTimestamp: Math.floor(dayjs().unix()),
                    })
                  }
                />

                <Button
                  title="History"
                  onPress={() =>
                    navigation.navigate("ViewResponses", {
                      prompt: item,
                    })
                  }
                />

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
                            const res = await promptService.deletePrompt(
                              item.uuid
                            );
                            if (res) {
                              appInsights.trackEvent(
                                { name: "prompt_deleted" },
                                {
                                  identifier: await maskPromptId(item.uuid),
                                }
                              );

                              setSavedPrompts(res);
                            }
                          },
                        },
                      ]
                    );
                  }}
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
