import RNBottomSheet, {
  BottomSheetHandle,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { FC, RefObject, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { BottomSheet } from "../../bottom-sheet";
import { Button } from "../../button";
import { Close, LeftArrow } from "../../icons";
import { promptSelectionDays } from "../../timepicker/data";
import { TimePicker } from "../../timepicker/timepicker";
import { Success } from "../success";

import { CategorySelectionStep } from "./category-selection-step";
import { PromptDetailsStep } from "./prompt-details-step";

import { PromptResponseType } from "~/@types";
import { useCreatePrompt } from "~/hooks";

interface CreatePromptSheetProps {
  promptSheetRef: RefObject<RNBottomSheet>;
}

export const CreatePromptSheet: FC<CreatePromptSheetProps> = ({
  promptSheetRef,
}) => {
  const { mutateAsync, isLoading: isCreatingPrompt } = useCreatePrompt();
  const startDate = useMemo(() => dayjs().startOf("day").add(8, "hour"), []);
  const endDate = useMemo(
    () => startDate.endOf("day").subtract(2, "hour").add(1, "minute"),
    []
  );
  const [activeStep, setActiveStep] = useState(0);
  const [category, setCategory] = useState("");
  const [promptText, setPromptText] = useState("");
  const [responseType, setResponseType] = useState<PromptResponseType | null>(
    null
  );
  const [customOptions, setCustomOptions] = useState<string[]>([]);

  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  const [days, setDays] = useState(promptSelectionDays);
  const [promptCount, setPromptCount] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const navigation = useNavigation();

  const handleClose = () => {
    setActiveStep(0);
    setCategory("");
    setPromptText("");
    setResponseType(null);
    setCustomOptions([]);
    setStart(startDate);
    setEnd(endDate);
    setDays(promptSelectionDays);
    setPromptCount(0);
    const redirectToHome = !!success;
    setSuccess(false);
    promptSheetRef.current?.close();
    if (redirectToHome) {
      navigation.navigate("PromptNavigator", { screen: "Prompts" });
    }
  };

  const paddingBottom = useMemo(
    () =>
      success
        ? 0
        : activeStep === 0
        ? 100
        : activeStep === 1
        ? 280
        : activeStep === 2
        ? 200
        : 0,
    [activeStep, success]
  );

  const snapPoints = useMemo(
    () =>
      success
        ? [340]
        : activeStep === 0
        ? ["77%"]
        : activeStep === 1
        ? ["77%"]
        : activeStep === 2
        ? ["85%"]
        : ["75%"],
    [activeStep, success]
  );

  const buttonDisabled = useMemo(
    () =>
      success
        ? false
        : activeStep === 0
        ? category === ""
        : activeStep === 1
        ? promptText === "" || responseType === null
        : activeStep === 2
        ? start.isAfter(end) ||
          start.isSame(end) ||
          Object.values(days).every((value) => !value) ||
          promptCount === 0
        : false,
    [
      activeStep,
      category,
      promptText,
      responseType,
      start,
      end,
      days,
      promptCount,
      success,
    ]
  );

  const createPrompt = async () => {
    const res = await mutateAsync({
      promptText,
      responseType: responseType!,
      notificationConfig_days: days,
      notificationConfig_countPerDay: promptCount,
      notificationConfig_startTime: start.format("HH:mm"),
      notificationConfig_endTime: end.format("HH:mm"),
      additionalMeta: {
        category,
        isNotificationActive: true,
        customOptionText: customOptions.join(";"),
      },
    });

    if (res) {
      handleNextStep();
      setSuccess(true);
    }
  };

  useEffect(() => {
    if (success) {
      handleClose();
    }
  }, [success]);

  const handleComponent = (props: BottomSheetHandleProps) => {
    if (success) {
      return (
        <BottomSheetHandle
          {...props}
          style={{ paddingVertical: 18, length: 36 }}
        />
      );
    }

    return (
      <View className="flex flex-row items-center justify-around p-4">
        {activeStep > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            rounded
            className="bg-white/10"
            leftIcon={<LeftArrow width={20} height={21} color="white" />}
            onPress={handlePrevStep}
          />
        ) : null}
        <View className="flex flex-row items-center justify-center flex-1 gap-2">
          {[0, 1, 2].map((step) => (
            <View
              key={step}
              className={`w-[5px] h-[5px] rounded-full ${
                step === activeStep ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </View>
        {activeStep < 3 ? (
          <Button
            variant="ghost"
            size="icon"
            rounded
            className="bg-white/10"
            leftIcon={<Close width={18} height={18} color="white" />}
            onPress={handleClose}
          />
        ) : null}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={promptSheetRef}
      snapPoints={snapPoints}
      onClose={handleClose}
      handleComponent={handleComponent}
      renderFooter
      renderBackdrop
      footerButtonTitle={
        success ? "Close" : activeStep < 3 ? "Continue" : "Close"
      }
      primaryButtonProps={{
        disabled: buttonDisabled || isCreatingPrompt,
        loading: isCreatingPrompt,
      }}
      onHandlePrimaryButtonPress={
        success
          ? handleClose
          : activeStep < 2
          ? handleNextStep
          : activeStep === 2
          ? createPrompt
          : handleClose
      }
    >
      <ScrollView
        nestedScrollEnabled
        horizontal={false}
        indicatorStyle="white"
        className="flex-1 flex-col mt-5 overflow-y-auto px-4"
        contentContainerStyle={{
          paddingBottom,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {success ? (
          <Success text="Way to go! Your prompt has been created successfully!" />
        ) : activeStep === 0 ? (
          <CategorySelectionStep
            selectedCategory={category}
            setSelectedCategory={setCategory}
          />
        ) : activeStep === 1 ? (
          <PromptDetailsStep
            promptText={promptText}
            setPromptText={setPromptText}
            responseType={responseType}
            setResponseType={setResponseType}
            customOptions={customOptions}
            category={category}
            setCustomOptions={setCustomOptions}
          />
        ) : activeStep === 2 ? (
          <View className="flex flex-col">
            <Text className="text-white text-xl font-sans-bold mb-4">
              Set time and frequency
            </Text>
            <TimePicker
              start={start}
              end={end}
              setEnd={setEnd}
              setStart={setStart}
              days={days}
              setDays={setDays}
              setPromptCount={setPromptCount}
            />
          </View>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
};
