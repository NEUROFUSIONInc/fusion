import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
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
  TouchableHighlight,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import Tooltip from "react-native-walkthrough-tooltip";

import { PromptResponse } from "~/@types";
import { Button, Calendar, Input, Tag } from "~/components";
import { AccountContext } from "~/contexts/account.context";
import { usePrompt } from "~/hooks";
import { RouteProp } from "~/navigation/types.js";
import { notificationService, promptService } from "~/services";
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
  const [userResponse, setUserResponse] = React.useState(
    route.params.previousPromptResponse?.value ?? ""
  );
  const [additonalNotes, setAdditionalNotes] = React.useState(
    route.params.previousPromptResponse?.additionalMeta?.note ?? ""
  );
  const notificationTriggerTimestamp = route.params.triggerTimestamp
    ? route.params.triggerTimestamp
    : Math.floor(dayjs().unix());
  const [promptResponseTimeObj, setPromptResponseTimeObj] = React.useState(
    route.params.previousPromptResponse
      ? dayjs(route.params.previousPromptResponse.responseTimestamp)
      : dayjs()
  );
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);

  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    const customOptions = prompt?.additionalMeta?.customOptionText;
    if (prompt?.responseType === "customOptions" && customOptions) {
      setCustomOptions(customOptions.split(";"));
    }

    // write event to app insights
    appInsights.trackPageView({
      name: "PromptEntry",
      properties: {
        identifier: maskPromptId(prompt?.uuid!),
        userNpub: accountContext?.userNpub,
      },
    });
  }, [prompt]);

  const handleCustomOptionChange = (option: string) => {
    if (typeof userResponse === "string" && userResponse === "") {
      setUserResponse([option].toString());
      return;
    }

    setUserResponse((prevResponse) => {
      const parsedResponse = prevResponse.split(";");
      if (parsedResponse.includes(option)) {
        // Remove the option if it already exists
        return parsedResponse
          .filter((item: string) => item !== option)
          .join(";");
      } else {
        // Add the option to the array
        return [...parsedResponse, option].join(";");
      }
    });
  };

  const queryClient = useQueryClient();

  // TODO: move date picker logic to it's own component
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleDatePickerConfimm = (date: Date) => {
    setPromptResponseTimeObj(dayjs(date));
    hideDatePicker();
  };
  const [toolTipVisible, setToolTipVisible] = React.useState(false);

  // logic to display tooltip for the first time
  React.useEffect(() => {
    (async () => {
      const seenPromptTooltip = await AsyncStorage.getItem("seenPromptTooltip");
      if (seenPromptTooltip !== "true") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setToolTipVisible(true);
        await AsyncStorage.setItem("seenPromptTooltip", "true");
      }
    })();
  }, []);

  const handleSavePromptResponse = async () => {
    if (!prompt) {
      return;
    }

    if (userResponse === "") {
      Alert.alert("Error", "Please enter a response");
      return;
    }

    const promptResponse: PromptResponse = {
      promptUuid: route.params.promptUuid,
      triggerTimestamp: notificationTriggerTimestamp,
      responseTimestamp: Math.floor(promptResponseTimeObj.unix()),
      value: userResponse,
      additionalMeta: {
        note: additonalNotes,
      },
    };

    if (route.params.previousPromptResponse) {
      promptResponse.id = route.params.previousPromptResponse.id;
    }

    // save the prompt entry
    const res = await promptService.savePromptResponse(
      promptResponse,
      queryClient
    );

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
          userNpub: accountContext?.userNpub,
        }
      );

      // clear the notification tray for this prompt
      await notificationService.removeNotificationsForPromptFromTray(
        prompt.uuid as unknown as string
      );
      // navigate to prompt responses screen or the next prompt
      if (
        route.params.prompts &&
        route.params.index !== undefined &&
        route.params.index + 1 < route.params.prompts.length
      ) {
        // console.log("showing the next prompt");
        // clear stack history first
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "PromptNavigator",
                state: {
                  routes: [
                    {
                      name: "PromptEntry",
                      params: {
                        promptUuid:
                          route.params.prompts[route.params.index + 1].uuid,
                        prompts: route.params.prompts,
                        index: route.params.index + 1,
                      },
                    },
                  ],
                },
              },
            ],
          })
        );
      } else {
        // clear stack history first
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "InsightsNavigator",
                state: {
                  routes: [
                    {
                      name: "InsightsPage",
                      params: {
                        promptUuid: prompt.uuid,
                      },
                    },
                  ],
                },
              },
            ],
          })
        );
      }
    }
  };

  const handleNavigation = (action: string) => {
    if (action === "Cancel") {
      // clear stack history first
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "InsightsNavigator",
              state: {
                routes: [
                  {
                    name: "InsightsPage",
                    params: {
                      promptUuid: prompt!.uuid,
                    },
                  },
                ],
              },
            },
          ],
        })
      );
    } else if (action === "Delete") {
      Alert.alert(
        "Delete Response",
        "Are you sure you want to delete this response? You won't be able to recover it in the future.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              if (route.params.previousPromptResponse) {
                const res = await promptService.deletePromptResponse(
                  route.params.previousPromptResponse.id!
                );
                if (res) {
                  Toast.show({
                    type: "success",
                    text1: "Prompt Response Deleted",
                    text2: "Your prompt response has been deleted successfully",
                  });
                  // clear stack history first
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: "InsightsNavigator",
                          state: {
                            routes: [
                              {
                                name: "InsightsPage",
                                params: {
                                  promptUuid: prompt!.uuid,
                                },
                              },
                            ],
                          },
                        },
                      ],
                    })
                  );
                }
              }
            },
          },
        ]
      );
    }
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
              <Tooltip
                isVisible={toolTipVisible}
                content={
                  <Text className="text-base font-sans">
                    Tap to change response time.
                  </Text>
                }
                placement="top"
                onClose={() => setToolTipVisible(false)}
              >
                <TouchableHighlight
                  className="flex flex-row justify-center items-end mb-10"
                  onPress={showDatePicker}
                >
                  <>
                    <View className="mr-2">
                      <Calendar width={20} height={20} />
                    </View>
                    <Text className="font-sans text-center text-white">
                      {promptResponseTimeObj.format("ddd, MMMM D, h:mm A")}
                    </Text>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="datetime"
                      maximumDate={dayjs().toDate()}
                      minuteInterval={5}
                      date={promptResponseTimeObj.toDate()}
                      onConfirm={handleDatePickerConfimm}
                      onCancel={hideDatePicker}
                    />
                  </>
                </TouchableHighlight>
              </Tooltip>
              <View className="mb-5">
                <Text className="font-sans-bold text-center text-lg text-white">
                  {prompt.promptText}
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

              {/* if the prompt is a custom prompt, show the custom options */}
              {prompt.responseType === "customOptions" &&
                customOptions.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-1 w-full h-20 flex-row gap-x-2 gap-y-3 mt-2">
                      {customOptions.map((option) => (
                        <Tag
                          key={option}
                          title={option}
                          isActive={userResponse.split(";").includes(option)}
                          handleValueChange={() =>
                            handleCustomOptionChange(option)
                          }
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}

              {
                // TODO: Add a photo
              }

              {/* Add additional notes */}
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
          title="Save response"
          fullWidth
          onPress={handleSavePromptResponse}
          disabled={userResponse === ""}
        />
        {route.params.previousPromptResponse && (
          <Button
            title="Delete Response"
            fullWidth
            textColor="red"
            onPress={() => {
              handleNavigation("Delete");
            }}
          />
        )}
        <Button
          title="Cancel"
          variant="ghost"
          fullWidth
          onPress={() => {
            handleNavigation("Cancel");
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
