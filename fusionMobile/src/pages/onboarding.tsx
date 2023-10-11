import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";

import { LeftArrow } from "../components/icons";

import { Input } from "~/components";
import { Button } from "~/components/button";
import { AccountContext, OnboardingContext } from "~/contexts";
import { appInsights } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

export const OnboardingScreen = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const onboardingContext = React.useContext(OnboardingContext);
  const accountContext = React.useContext(AccountContext);

  const [onboardingEmail, setOnboardingEmail] = useState("");

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Onboarding",
      properties: {},
    });
  });

  const slides = [
    {
      title: "Engaging Personalized Prompts",
      description:
        "Manage and improve your wellbeing with customized prompts. You’ll get notified to respond to them based on times you set.",
      image: require("../../assets/onboarding/engaging-prompts.png"),
    },
    {
      title: "Your Prompts and Responses are saved locally on your device",
      description:
        "Your privacy is important to us, so we’ve set up an anonymous account just for you. This is your unique identity on Fusion.",
      image: require("../../assets/onboarding/prompt_responses.png"),
    },
    {
      title: "Get summaries and recommendations with AI",
      description:
        "Fusion Copilot will send you summaries and suggested actions based on your responses over time.",
      // image: require("../../assets/onboarding/fusion-copilot.png"),
      image: require("../../assets/onboarding/intelligent_recommendations.png"),
      onclick: async () => {
        appInsights.trackEvent({
          name: "onboarding_copilot_triggered",
          properties: {
            userNpub: accountContext!.userNpub,
          },
        });

        const consentStatus = await requestCopilotConsent(
          accountContext!.userNpub
        );
        // set account context value
        accountContext?.setUserPreferences({
          ...accountContext.userPreferences,
          enableCopilot: consentStatus,
        });
      },
    },
    {
      title: "Stay in the loop",
      description:
        "Get updates from the team, on features, experiments and more. This is not linked to your fusion account, it’s only to send you mail.",
      image: require("../../assets/onboarding/fusion-newsletter.png"),
      hasInput: true,
      onclick: () => {
        if (onboardingEmail !== "") {
          // make api call to add email to newsletter
          appInsights.trackEvent({
            name: "onboarding_newsletter",
            properties: {
              email: onboardingEmail,
            },
          });
        }
      },
      buttonText: "Get updates",
    },
  ];

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
        {activeSlideIndex > 1 && (
          <Pressable onPress={() => handleOnboardingComplete()}>
            <Text className="text-white text-base">Skip</Text>
          </Pressable>
        )}
      </View>
      <View className="justify-center items-center mt-4">
        <Text className="font-sans-bold max-w-xs text-center text-white text-lg">
          {slides[activeSlideIndex].title}
        </Text>
      </View>

      <View className="item-center">
        <Image
          className="w-full h-4/5 mt-10"
          style={{ resizeMode: "contain" }}
          source={slides[activeSlideIndex].image}
        />
      </View>

      <View className="bg-white rounded-t-lg h-2/5 absolute bottom-0 pt-10 w-full">
        <View className="justify-between h-4/5 px-6">
          <Text className="font-sans-medium text-center text-dark text-lg">
            {slides[activeSlideIndex].description}
          </Text>

          {slides[activeSlideIndex].hasInput && (
            <Input
              value={onboardingEmail}
              className="my-5 border-2 border-tint rounded text-dark text-base leading-1.5"
              onChangeText={setOnboardingEmail}
              placeholderTextColor="#181230"
              placeholder="e.g you@example.com"
            />
          )}

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
              onPress={async () => {
                if (slides[activeSlideIndex].onclick) {
                  await slides[activeSlideIndex].onclick!();
                }

                if (activeSlideIndex === slides.length - 1) {
                  handleOnboardingComplete();
                } else {
                  panActiveSlide("right");
                }
              }}
              className="bg-dark px-10 py-3"
              title={slides[activeSlideIndex].buttonText ?? "Next"}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
