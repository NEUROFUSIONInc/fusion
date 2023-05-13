import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { fetchPromptById, savePromptResponse, maskPromptId } from "../utils";
import Checkbox from "expo-checkbox";
import dayjs from "dayjs";
import appInsights from "../utils/appInsights";

// this component is to allow a user make a prompt entry.
export function PromptEntryScreen({ navigation, route }) {
  const [promptObject, setPromptObject] = React.useState(null);

  const [notificationTriggerTimestamp, setNotificationTriggerTimestamp] =
    React.useState(Math.floor(dayjs().unix()));

  const yesnoOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const [promptResponse, setPromptResponse] = React.useState("");

  React.useEffect(() => {
    if (route.params && route.params.promptUuid) {
      console.log(route.params.promptUuid);
      (async () => {
        const res = await fetchPromptById(route.params.promptUuid);
        console.log(res);
        if (res) {
          setPromptObject(res);
        }
      })();
    }

    if (route.params && route.params.triggerTimestamp) {
      setNotificationTriggerTimestamp(route.params.triggerTimestamp);
    }
  }, []);

  const handleSavePromptEntry = async () => {
    // generate event object & save entry
    // direct user to the prompt responses screen
    const promptEntry = {
      promptUuid: promptObject.uuid,
      triggerTimestamp: notificationTriggerTimestamp,
      responseTimestamp: Math.floor(dayjs().unix()),
      value: promptResponse,
    };

    console.log(promptEntry);

    // save the prompt entry
    const res = await savePromptResponse(promptEntry);

    if (res) {
      // track event
      appInsights.trackEvent(
        {
          name: "prompt_notification_response",
        },
        {
          identifier: await maskPromptId(promptEntry.promptUuid),
          triggerTimestamp: promptEntry.triggerTimestamp,
          responseTimestamp: promptEntry.responseTimestamp,
        }
      );

      // navigate to prompt responses screen
      navigation.replace("ViewResponses", {
        prompt: promptObject,
      });
    }
  };

  return (
    <View style={styles.container}>
      {promptObject && (
        <View style={{ width: "100%" }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.text}>{promptObject.promptText}</Text>
            <Text style={styles.actionDescription}>
              Enter your response below
            </Text>
          </View>

          {/* if the prompt is a yes/no prompt, show the yes/no buttons */}
          {promptObject.responseType == "yesno" && (
            <View style={styles.optionsContainer}>
              {Object.keys(yesnoOptions).map((key) => {
                return (
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      value={promptResponse == yesnoOptions[key].value}
                      onValueChange={() => {
                        setPromptResponse(yesnoOptions[key].value);
                      }}
                    />
                    <Text>&nbsp;&nbsp;{yesnoOptions[key].label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* if the prompt is a text prompt, show the text input */}
          {promptObject.responseType == "text" && (
            <View>
              <TextInput
                multiline={true}
                numberOfLines={4}
                onChangeText={setPromptResponse}
                value={promptResponse}
                style={styles.textInput}
              />
            </View>
          )}

          {/* if the prompt is a multiple choice prompt, show the options */}
          {promptObject.responseType == "number" && (
            <View>
              <TextInput
                inputMode="numeric"
                keyboardType="numeric"
                onChangeText={setPromptResponse}
                value={promptResponse}
                style={styles.numberInput}
              />
            </View>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title="Save Entry" onPress={handleSavePromptEntry}></Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "100%",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionDescription: {
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  textInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    lineHeight: 25,
  },
  numberInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
