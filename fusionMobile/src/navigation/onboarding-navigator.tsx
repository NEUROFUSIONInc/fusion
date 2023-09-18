import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";

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
      <View>
        <Button
          title="Continue"
          className="m-0 px-4 py-2 self-center "
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
    setOnboardingPromptScreen(true);
  };

  const renderSlide = () => {
    const slide = slides[nextStep - 1];
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
        >
          {nextStep > 1 ? (
            <Pressable onPress={handleBackSlide}>
              {/* <Text className="text-white text-base">Back</Text> */}
              <Image
                style={{ resizeMode: "contain", width: 40, height: 35 }}
                source={require("../../assets/arrow-left.png")}
              />
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={() => setOnboardingPromptScreen(true)}>
            <Text className="text-white text-base">Skip</Text>
          </Pressable>
        </View>
        <View
          style={{
            justifyContent: "center",
            marginTop: 27,
            alignItems: "center",
          }}
        >
          <Text className="font-sans-bold max-w-xs text-center text-white text-lg">
            {slide.title}
          </Text>
        </View>
        <Image
          style={{ resizeMode: "contain", width: "100%", height: "68%" }}
          source={slide.image}
        />
        <View
          style={{
            backgroundColor: "#fff",
            height: "40%",
            width: "100%",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            position: "absolute",
            bottom: 0,
            paddingTop: 40,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              height: "80%",
              paddingHorizontal: 24,
            }}
          >
            <Text className="font-sans-medium text-center text-dark text-base">
              {slide.description}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {renderIndicator()}
              <Pressable
                onPress={nextStep > 3 ? handleInitialPrompt : handleNextSlide}
                style={{
                  backgroundColor: "#0B0816",
                  paddingHorizontal: 30,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
              >
                <Text className="text-base text-white font-sans">
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
    <View style={{ flex: 1 }}>
      {onboardingPromptScreen ? <OnboardPromptScreen /> : renderSlide()}
    </View>
  );
};
