import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import Checkbox from "expo-checkbox";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { Prompt } from "~/@types/index.js";
import { PromptScreenNavigationProp } from "~/navigation/prompt-navigator";
import { RouteProp } from "~/navigation/types.js";
import {
  fetchPromptById,
  savePromptResponse,
  maskPromptId,
  appInsights,
} from "~/utils";

// this component is to allow a user make a prompt entry.
export function PromptEntryScreen() {
  const route = useRoute<RouteProp<"PromptEntry">>();
  const navigation = useNavigation<PromptScreenNavigationProp>();

  const [promptObject, setPromptObject] = React.useState<Prompt | null>();

  const notificationTriggerTimestamp = route.params.triggerTimestamp
    ? route.params.triggerTimestamp
    : Math.floor(dayjs().unix());

  const yesnoOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const [userResponse, setUserResponse] = React.useState("");

  React.useEffect(() => {
    if (route.params?.promptUuid) {
      console.log(route.params.promptUuid);
      (async () => {
        const res = await fetchPromptById(route.params.promptUuid);
        setPromptObject(res);
      })();
    }
  }, []);

  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (promptObject?.responseType=="customOptions") {
      setCustomOptions(promptObject.additionalMeta["customOptionText"].split(";")); //generates customOptions from additionalMeta
    }
  }, [promptObject])

  const handleSavePromptResponse = async () => {
    // generate event object & save entry
    // direct user to the prompt responses screen
    if (!promptObject) {
      return;
    }

    const promptResponse = {
      promptUuid: route.params.promptUuid,
      triggerTimestamp: notificationTriggerTimestamp,
      responseTimestamp: Math.floor(dayjs().unix()),
      value: userResponse,
    };

    console.log(promptResponse);

    // save the prompt entry
    const res = await savePromptResponse(promptResponse);

    if (res) {
      // track event
      appInsights.trackEvent(
        {
          name: "prompt_response",
        },
        {
          identifier: await maskPromptId(promptResponse.promptUuid),
          triggerTimestamp: promptResponse.triggerTimestamp,
          responseTimestamp: promptResponse.responseTimestamp,
        }
      );

      // navigate to prompt responses screen
      navigation.replace("ViewResponses", {
        prompt: promptObject,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%" }}>
          {promptObject && (
            <View>
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>{promptObject.promptText}</Text>
                <Text style={styles.actionDescription}>
                  Enter your response below
                </Text>
              </View>

              {/* if the prompt is a yes/no prompt, show the yes/no buttons */}
              {promptObject.responseType === "yesno" && (
                <View style={styles.optionsContainer}>
                  {yesnoOptions.map(({ label, value }) => {
                    return (
                      <View style={styles.checkboxContainer}>
                        <Checkbox
                          value={userResponse === value}
                          onValueChange={() => {
                            setUserResponse(value);
                          }}
                        />
                        <Text>&nbsp;&nbsp;{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* if the prompt is a text prompt, show the text input */}
              {promptObject.responseType === "text" && (
                <View>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onChangeText={setUserResponse}
                    value={userResponse}
                    style={styles.textInput}
                  />
                </View>
              )}

              {/* if the prompt is a multiple choice prompt, show the options */}
              {promptObject.responseType === "number" && (
                <View>
                  <TextInput
                    inputMode="numeric"
                    keyboardType="numeric"
                    onChangeText={setUserResponse}
                    value={userResponse}
                    style={styles.numberInput}
                  />
                </View>
              )}

              {/* if the prompt is a custom prompt, show the custom options */
              promptObject.responseType === "customOptions" && (customOptions.length > 0) && (
                
                <View style={styles.customOptionsContainer}>
                  {customOptions.map((option) => (
                      <View style={[{ marginTop: 10 },styles.checkboxContainer]}>
                        <Checkbox
                          value={userResponse === option}
                          onValueChange={() => {
                            setUserResponse(option);
                          }}
                        />
                        <Text>&nbsp;&nbsp;{option}</Text>
                      </View>
                  ))}
                </View>
              )}

              <View style={{ marginTop: 20 }}>
                <Button title="Save Entry" onPress={handleSavePromptResponse} />
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  customOptionsContainer:{
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    alignContent:"center",
    height:200,
    flexDirection:"row"
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
