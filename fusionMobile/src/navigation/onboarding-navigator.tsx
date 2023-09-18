import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";

import { LeftArrow } from "../components/icons";

import { Button } from "~/components/button";
import { OnboardingContext } from "~/contexts";

const slides = [
  {
    title: "Real-time Tracking and Feedback through Experience Sampling",
    description:
      "Use experience sampling to track patterns over time, gather real-time feedback through simple response options.",
    image: require("../../assets/slide-one.png"),
  },
  {
    title: "Data Analysis for Insights and Relationship Discovery",
    description:
      "Gain immediate insights into recorded data and uncover relationships between different data points",
    image: require("../../assets/slide-two.png"),
  },
  {
    title: "Connect Your Data Sources",
    description:
      "Connect your health devices, synced with Apple Health/Google Fit, to consolidate your health data.",
    image: require("../../assets/slide-three.png"),
  },
  {
    title: "See How Your Body Changes In the Moment",
    description:
      "Author and participate in engaging experiments while simultaneously recording EEG (electroencephalogram) data on the go",
    image: require("../../assets/slide-four.png"),
  },
];

const OnboardPromptScreen = () => {
  const onboardingContext = React.useContext(OnboardingContext);
  return (
    <View className="px-8">
      <View className="flex justify-center items-center mt-6">
        <Text className="font-sans-bold text-center text-white text-base pb-2">
          What’s been top of mind for you lately
        </Text>
        <Text className="font-sans-light max-w-xs text-center text-white text-base">
          We will use this to suggest you prompts
        </Text>
      </View>
      {/* Add content for the new screen */}
      <View className="">
        <Button
          title="Continue"
          className="m-0 px-4 py-2 self-center"
          fullWidth
          onPress={() => {
            onboardingContext?.setShowOnboarding(false);
          }}
        />
      </View>
    </View>
  );
};

export const OnboardingNavigator = () => {
  const [nextStep, setNextStep] = useState(1);
  const [onboardingPromptScreen, setOnboardingPromptScreen] = useState(false);
  const onboardingContext = React.useContext(OnboardingContext);

  const navigation = useNavigation();

  const handleNextSlide = () => {
    if (nextStep < slides.length) {
      setNextStep(nextStep + 1);
      setOnboardingPromptScreen(false);
    }
  };

  const handleBackSlide = () => {
    if (nextStep > 1) {
      setNextStep(nextStep - 1);
      setOnboardingPromptScreen(false);
    }
  };

  const handleInitialPrompt = () => {
    console.log("test");
  };

  const renderSlide = () => {
    const slide = slides[nextStep - 1];
    return (
      <View className="flex-1">
        <View className="justify-between flex-row px-4">
          {nextStep > 1 ? (
            <Button
              variant="ghost"
              size="icon"
              leftIcon={<LeftArrow width={32} height={32} />}
              onPress={handleBackSlide}
            />
          ) : (
            <View />
          )}
          <Pressable onPress={() => setOnboardingPromptScreen(true)}>
            <Text className="text-white text-base">Skip</Text>
          </Pressable>
        </View>
        <View className="justify-center items-center mt-4">
          <Text className="font-sans-bold max-w-xs text-center text-white text-lg">
            {slide.title}
          </Text>
        </View>
        <Image
          className="w-full h-3/5"
          style={{ resizeMode: "contain" }}
          source={slide.image}
        />
        <View className="bg-white rounded-t-lg h-2/5 absolute bottom-0 pt-10 w-full">
          <View className="justify-between h-4/5 px-6">
            <Text className="font-sans-medium text-center text-dark text-lg">
              {slide.description}
            </Text>
            <View className="flex-row justify-between items-center">
              {renderIndicator()}
              <Pressable
                onPress={nextStep > 3 ? handleInitialPrompt : handleNextSlide}
              >
                <Text className="bg-dark px-10 py-3 rounded text-white text-base">
                  {nextStep > 3 ? "Continue" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderIndicator = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:
                index + 1 === nextStep ? "#181230" : "transparent",
              borderColor: index + 1 !== nextStep ? "#181230" : "transparent",
              borderWidth: 1,
              marginHorizontal: 5,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1">
      {onboardingPromptScreen ? <OnboardPromptScreen /> : renderSlide()}
    </View>
  );
};
