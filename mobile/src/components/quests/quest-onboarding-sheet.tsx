import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import dayjs from "dayjs";
import { FC, RefObject, useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Text,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { black } from "tailwindcss/colors";

import { BottomSheet } from "../bottom-sheet/bottom-sheet";
import { Button } from "../button";
import { ChevronRight } from "../icons";
import { Input } from "../input";
import { Tag } from "../tag";

import {
  OnboardingQuestion,
  OnboardingResponse,
  Quest,
  yesNoOptions,
} from "~/@types";
import { IS_IOS } from "~/config";
import { questService } from "~/services";

interface QuestOnboardingSheetProps {
  bottomSheetRef: RefObject<RNBottomSheet>;
  quest: Quest;
  callback: (onboardingResponses: OnboardingResponse[]) => void;
}

export const QuestOnboardingSheet: FC<QuestOnboardingSheetProps> = ({
  bottomSheetRef,
  quest,
  callback,
}) => {
  const [loading, setLoading] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(["60%"]);

  const [onboardingQuestions, setOnboardingQuestions] = useState<
    OnboardingQuestion[]
  >([]);
  const [onboardingResponses, setOnboardingResponses] = useState<
    OnboardingResponse[]
  >([]);

  // initializes the onboarding questions state
  useEffect(() => {
    if (quest?.config) {
      setOnboardingQuestions(JSON.parse(quest.config).onboardingQuestions);
    }
  }, [quest]);

  const handleSaveResponses = async () => {
    try {
      setLoading(true);
      // Validate required fields
      const missingRequired = onboardingQuestions
        .filter((q) => q.required)
        .find(
          (q) =>
            !onboardingResponses
              .find((r) => r.guid === q.guid)
              ?.responseValue?.trim()
        );

      if (missingRequired) {
        Alert.alert(
          "Required Field Missing",
          `Please answer: ${missingRequired.question}`
        );
        return;
      }

      const res = await questService.uploadOnboardingResponses(
        quest.guid,
        onboardingResponses
      );

      if (!res) {
        throw new Error("Failed to save onboarding responses");
      }

      Toast.show({
        type: "success",
        text1: "Responses saved successfully",
      });

      // call the method that adds user to quest
      Keyboard.dismiss();
      callback(onboardingResponses);
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error("Failed to save responses", error);
      Alert.alert(
        "Error",
        "Failed to save responses. Please try again or contact quest organizer."
      );
    } finally {
      setLoading(false);
    }
  };

  // updates the onboarding responses state
  const handleInputChange = (question: OnboardingQuestion, value: string) => {
    setOnboardingResponses(
      onboardingResponses.map((response) => {
        if (response.guid === question.guid) {
          return {
            ...response,
            responseValue: value,
            responseTimestamp: dayjs().unix(),
          };
        }
        return response;
      })
    );
  };

  // initializes the onboarding responses state
  useEffect(() => {
    setOnboardingResponses(
      onboardingQuestions.map((question) => ({
        ...question,
        responseValue: "",
        responseTimestamp: 0,
      }))
    );
  }, [onboardingQuestions]);

  return (
    <Portal>
      <BottomSheet ref={bottomSheetRef} snapPoints={sheetHeight}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={IS_IOS ? 130 : 0}
          className="flex flex-1 w-full h-full justify-center gap-y-10 flex-col p-5"
        >
          <View className="flex flex-col gap-y-2.5">
            {onboardingQuestions.map((question) => {
              if (question.type === "text") {
                return (
                  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <Input
                      value={
                        onboardingResponses.find(
                          (r) => r.guid === question.guid
                        )?.responseValue ?? ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(question, value)
                      }
                      label={question.question}
                      className="h-[50] leading-1.5 mx-4"
                      placeholder={question.question}
                      onTouchStart={() => {
                        setSheetHeight(["100%"]);
                      }}
                      onEndEditing={() => {
                        setSheetHeight(["45%"]);
                        Keyboard.dismiss();
                      }}
                    />
                  </TouchableWithoutFeedback>
                );
              } else if (question.type === "number") {
                return (
                  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View>
                      <Input
                        label={question.question}
                        inputMode="decimal"
                        keyboardType="decimal-pad"
                        onChangeText={(value) =>
                          handleInputChange(question, value)
                        }
                        value={
                          onboardingResponses.find(
                            (r) => r.guid === question.guid
                          )?.responseValue ?? ""
                        }
                        className="h-[50] leading-1.5 mx-4"
                        onTouchStart={() => {
                          setSheetHeight(["100%"]);
                        }}
                        onEndEditing={() => {
                          setSheetHeight(["45%"]);
                          Keyboard.dismiss();
                        }}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                );
              } else if (question.type === "yesno") {
                return (
                  <View className="flex flex-col gap-y-2.5 my-2">
                    <Text className="font-sans text-base text-white mb-3 mt-3">
                      {question.question}
                    </Text>

                    <View className="flex flex-row justify-evenly">
                      {yesNoOptions.map(({ label, value }) => {
                        return (
                          <Tag
                            key={label}
                            title={label}
                            isActive={
                              onboardingResponses.find(
                                (r) => r.guid === question.guid
                              )?.responseValue === value
                            }
                            handleValueChange={(checked) => {
                              console.log("checked", checked);
                              if (checked) {
                                handleInputChange(question, value);
                              }
                            }}
                          />
                        );
                      })}
                    </View>
                  </View>
                );
              }
            })}
            <Button
              title="Save Responses"
              rightIcon={<ChevronRight color={black} />}
              fullWidth
              className="flex flex-row justify-between"
              onPress={handleSaveResponses}
              loading={loading}
            />
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Portal>
  );
};
