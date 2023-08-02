import {
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";

import { PromptResponse } from "~/@types";
import { Button, Input, Tag } from "~/components";
import { usePrompt } from "~/hooks";
import { RouteProp } from "~/navigation/types.js";
import { promptService } from "~/services";
import { maskPromptId, appInsights } from "~/utils";

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

// this component is to allow a user make a prompt entry.
export function PromptEntryScreen() {
  const route = useRoute<RouteProp<"PromptEntry">>();
  const navigation = useNavigation<any>();
  const { data: prompt } = usePrompt(route.params.promptUuid);
  const [userResponse, setUserResponse] = React.useState("");
  const [additonalNotes, setAdditionalNotes] = React.useState("");
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  const notificationTriggerTimestamp = route.params.triggerTimestamp
    ? route.params.triggerTimestamp
    : Math.floor(dayjs().unix());

  React.useEffect(() => {
    navigation.setOptions({});
  }, []);

  React.useEffect(() => {
    const customOptions = prompt?.additionalMeta?.customOptionText;
    if (prompt?.responseType === "customOptions" && customOptions) {
      setCustomOptions(customOptions.split(";"));
    }
  }, [prompt]);

  const handleSavePromptResponse = async () => {
    if (!prompt) {
      return;
    }

    if (userResponse === "") {
      Alert.alert("Error", "Please enter a response");
      return;
    }
    let formattedResponse = userResponse;

    if (prompt.responseType === "customOptions") {
      // Check if the response is an array and convert it to a comma-separated string
      if (Array.isArray(JSON.parse(userResponse))) {
        formattedResponse = JSON.parse(userResponse).join(";");
      }
    }

    const promptResponse: PromptResponse = {
      promptUuid: route.params.promptUuid,
      triggerTimestamp: notificationTriggerTimestamp,
      responseTimestamp: Math.floor(dayjs().unix()),
      value: formattedResponse,
      additionalMeta: {
        note: additonalNotes,
      },
    };

    // save the prompt entry
    const res = await promptService.savePromptResponse(promptResponse);

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
      // clear stack history first
      navigation.dispatch(StackActions.popToTop());
      navigation.navigate("InsightsNavigator", {
        screen: "InsightsPage",
        params: {
          promptUuid: prompt.uuid,
        },
      });
    }
  };

  const handleCustomOptionChange = (option: string) => {
    if (typeof userResponse === "string" && userResponse === "") {
      setUserResponse(JSON.stringify([option]));
      return;
    }

    setUserResponse((prevResponse) => {
      const parsedResponse = JSON.parse(prevResponse) || [];
      if (Array.isArray(parsedResponse)) {
        if (parsedResponse.includes(option)) {
          // Remove the option if it already exists
          return JSON.stringify(
            parsedResponse.filter((item: string) => item !== option)
          );
        } else {
          // Add the option to the array
          return JSON.stringify([...parsedResponse, option]);
        }
      }
      return prevResponse;
    });
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex flex-grow flex-col h-full w-full items-stretch justify-center bg-dark px-5"
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <Pressable
          onPress={Keyboard.dismiss}
          className="flex flex-1 justify-center mt-10"
        >
          {prompt && (
            <View>
              <View className="mb-5">
                <Text className="font-sans-bold text-center text-lg text-white">
                  {prompt.promptText}
                </Text>
                <Text className="font-sans text-center text-base text-white/50">
                  Log this prompt to record a response
                </Text>
              </View>

              {/* if the prompt is a yes/no prompt, show the yes/no buttons */}
              {prompt.responseType === "yesno" && (
                <View className="flex flex-row justify-evenly mt-5">
                  {yesNoOptions.map(({ label, value }) => {
                    return (
                      <Tag
                        key={label}
                        title={label}
                        isActive={userResponse === value}
                        handleValueChange={(checked) => {
                          setUserResponse(checked ? value : "");
                        }}
                      />
                    );
                  })}
                </View>
              )}

              {/* if the prompt is a text prompt, show the text input */}
              {prompt.responseType === "text" && (
                <View>
                  <Input
                    multiline
                    numberOfLines={4}
                    onChangeText={setUserResponse}
                    value={userResponse}
                    className="leading-1.5 mx-4"
                    style={{ height: 144 }}
                  />
                </View>
              )}

              {/* if the prompt is a number, show the text input */}
              {prompt.responseType === "number" && (
                <View>
                  <Input
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    onChangeText={setUserResponse}
                    value={userResponse}
                    className="h-[50] leading-1.5 mx-4"
                  />
                </View>
              )}

              {
                /* if the prompt is a custom prompt, show the custom options */
                prompt.responseType === "customOptions" &&
                  customOptions.length > 0 && (
                    <View className="flex flex-row gap-x-2 gap-y-3 mt-3 flex-wrap mx-4 justify-center">
                      {customOptions.map((option) => (
                        <Tag
                          key={option}
                          title={option}
                          isActive={
                            Array.isArray(userResponse) &&
                            userResponse.includes(option)
                          }
                          handleValueChange={() =>
                            handleCustomOptionChange(option)
                          }
                        />
                      ))}
                    </View>
                  )
              }
              <View
                className={`${
                  prompt?.responseType !== "text" ? "mt-10" : "mt-0"
                }`}
              >
                {prompt?.responseType !== "text" && (
                  <Input
                    multiline
                    numberOfLines={4}
                    placeholder="Additional notes (optional)"
                    onChangeText={setAdditionalNotes}
                    value={additonalNotes}
                    className="pt-3 leading-1.5 mx-4 mb-8"
                    style={{ height: 112 }}
                  />
                )}
              </View>
            </View>
          )}
        </Pressable>
      </ScrollView>
      <View className="w-full flex flex-col gap-y-3 mb-3">
        <Button
          title="Log prompt response"
          fullWidth
          onPress={handleSavePromptResponse}
          disabled={
            userResponse === "" ||
            (prompt?.responseType === "customOptions" &&
              JSON.parse(userResponse).length === 0)
          }
        />
        <Button
          title="Cancel"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate("Prompts")}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
