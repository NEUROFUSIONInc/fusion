import AsyncStorage from "@react-native-async-storage/async-storage";
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
    image: require("../../assets/onboarding/slide-one.png"),
  },
  {
    title: "Data Analysis for Insights and Relationship Discovery",
    description:
      "Gain immediate insights into recorded data and uncover relationships between different data points",
    image: require("../../assets/onboarding/slide-two.png"),
  },
  //   {
  //     title: "Data Analysis for Insights and Relationship Discovery",
  //     description:
  //       "Gain immediate insights into recorded data and uncover relationships between different data points",
  //     image: require("../../assets/onboarding/slide-two.png"),
  //   },
  //   {
  //     title: "Connect Your Data Sources",
  //     description:
  //       "Connect your health devices, synced with Apple Health/Google Fit, to consolidate your health data.",
  //     image: require("../../assets/onboarding/slide-three.png"),
  //   },
  //   {
  //     title: "See How Your Body Changes In the Moment",
  //     description:
  //       "Author and participate in engaging experiments while simultaneously recording EEG (electroencephalogram) data on the go",
  //     image: require("../../assets/onboarding/slide-four.png"),
  //   },
];

export const OnboardingScreen = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const onboardingContext = React.useContext(OnboardingContext);

  const panActiveSlide = (direction: "left" | "right") => {
    if (direction === "left") {
      if (activeSlideIndex > 0) {
        setActiveSlideIndex(activeSlideIndex - 1);
      }
    } else if (direction === "right") {
      if (activeSlideIndex < slides.length - 1) {
        setActiveSlideIndex(activeSlideIndex + 1);
      }
    }
  };

  const handleOnboardingComplete = () => {
    (async () => {
      await AsyncStorage.setItem("onboarding_viewed", "true");
      onboardingContext?.setShowOnboarding(false);
    })();
  };

  return (
    <View className="flex-1">
      <View className="justify-between flex-row px-4">
        {activeSlideIndex > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            leftIcon={<LeftArrow width={32} height={32} />}
            onPress={() => panActiveSlide("left")}
          />
        ) : (
          <View />
        )}
        <Pressable onPress={() => handleOnboardingComplete()}>
          <Text className="text-white text-base">Skip</Text>
        </Pressable>
      </View>
      <View className="justify-center items-center mt-4">
        <Text className="font-sans-bold max-w-xs text-center text-white text-lg">
          {slides[activeSlideIndex].title}
        </Text>
      </View>
      <Image
        className="w-full"
        style={{ resizeMode: "contain" }}
        source={slides[activeSlideIndex].image}
      />

      <View className="bg-white rounded-t-lg h-2/5 absolute bottom-0 pt-10 w-full">
        <View className="justify-between h-4/5 px-6">
          <Text className="font-sans-medium text-center text-dark text-lg">
            {slides[activeSlideIndex].description}
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-row justify-center items-center">
              {slides.map((_, index) => (
                <Pressable
                  key={index}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor:
                      index === activeSlideIndex ? "#181230" : "transparent",
                    borderColor:
                      index !== activeSlideIndex ? "#181230" : "transparent",
                    borderWidth: 1,
                    marginHorizontal: 5,
                  }}
                  onPress={() => setActiveSlideIndex(index)}
                />
              ))}
            </View>

            <Button
              variant="primary"
              textColor="white"
              size="md"
              onPress={() => {
                if (activeSlideIndex === slides.length - 1) {
                  handleOnboardingComplete();
                } else {
                  panActiveSlide("right");
                }
              }}
              className="bg-dark px-10 py-3"
              title="Next"
            />
          </View>
        </View>
      </View>
    </View>
  );
};
