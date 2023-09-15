import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";

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
    image: require("../../assets/slide-one.png"),
  },
];

export const OnboardingNavigator = () => {
  const [nextStep, setNextStep] = useState(1);

  const handleNextSlide = () => {
    if (nextStep < slides.length) {
      setNextStep(nextStep + 1);
    }
  };

  const handleBackSlide = () => {
    if (nextStep > 1) {
      setNextStep(nextStep - 1);
    }
  };

  const handleInitialPrompt = () => {
    alert("hi");
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        {nextStep > 1 ? (
          <Pressable onPress={handleBackSlide}>
            <Text className="text-white text-base">Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={() => {}}>
          <Text className="text-white text-base">Skip</Text>
        </Pressable>
      </View>
    );
  };

  const renderSlide = () => {
    const slide = slides[nextStep - 1];
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            justifyContent: "center",
            marginTop: 27,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
              width: "80%",
              lineHeight: 28,
            }}
          >
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
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#00050C",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
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
      {renderHeader()}
      {renderSlide()}
    </View>
  );
};
