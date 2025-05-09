import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

import { Button, Reload, ThumbsUp, ThumbsDown } from "~/components";
import { AccountContext } from "~/contexts";
import { appInsights } from "~/utils";
import { requestCopilotConsent } from "~/utils/consent";

// New interface for suggestion cards
interface SuggestionCardProps {
  title: string;
  text: string;
  onPress: () => void;
}

// New suggestion card component
export const SuggestionCard = ({
  title,
  text,
  onPress,
}: SuggestionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-secondary-800 rounded-lg p-4 mr-3 w-48"
    >
      <Text className="text-white font-sans-bold mb-1">{title}</Text>
      <Text className="text-white/70 font-sans text-sm">{text}</Text>
    </TouchableOpacity>
  );
};

interface CopilotTriggerProps {
  title?: string;
  summaryText?: string;
  onReloadSummary?: () => void;
  contextName?: string;
  disableActions?: boolean;
  children?: React.ReactNode;
  suggestions?: {
    title: string;
    text: string;
    onPress: () => void;
  }[];
  promptMessage?: string;
}

export function CopilotTrigger({
  title,
  summaryText,
  onReloadSummary,
  contextName = "general",
  disableActions = false,
  children,
  suggestions,
  promptMessage,
}: CopilotTriggerProps) {
  const accountContext = React.useContext(AccountContext);

  return (
    <View className="flex flex-col w-full">
      {/* Copilot Card Header */}
      {title && (
        <View className="flex flex-row w-full justify-between p-5 items-center">
          <Text className="text-base font-sans-bold text-white justify">
            {title}
          </Text>
        </View>
      )}

      {/* Copilot Card Content */}
      <View className="flex flex-col w-full bg-secondary-900 rounded">
        <View>
          {/* Enable Copilot */}
          {!accountContext?.userLoading &&
            accountContext?.userPreferences.enableCopilot !== true && (
              <View className="flex flex-row w-full justify-between p-5">
                <Button
                  onPress={async () => {
                    // call bottom sheet
                    const consentStatus = await requestCopilotConsent(
                      accountContext!.userNpub
                    );
                    accountContext?.setUserPreferences({
                      ...accountContext.userPreferences,
                      enableCopilot: consentStatus,
                    });
                  }}
                  title="Get personalized recommendations"
                  className="px-4 py-2 self-center"
                  fullWidth
                />
              </View>
            )}

          {/* Summary Text - only render if provided and no children override it */}
          {summaryText && (
            <Text
              ellipsizeMode="tail"
              className="font-sans flex flex-wrap text-white text-base font-medium m-5"
            >
              {summaryText}
            </Text>
          )}

          {/* Conversation suggestions section */}
          {suggestions && suggestions.length > 0 && (
            <View className="mb-4 px-5">
              {promptMessage && (
                <Text className="text-white font-sans-bold text-lg mb-3">
                  {promptMessage}
                </Text>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={`suggestion-${index}`}
                    title={suggestion.title}
                    text={suggestion.text}
                    onPress={suggestion.onPress}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {children}

        <View className="flex flex-row w-full justify-between p-5">
          <Button
            variant="ghost"
            size="icon"
            leftIcon={<Reload />}
            onPress={() => {
              appInsights.trackEvent({
                name: "fusion_copilot_reload_summary",
                properties: {
                  context: contextName,
                  userNpub: accountContext?.userNpub,
                },
              });

              if (onReloadSummary) {
                onReloadSummary();
              }
            }}
            disabled={
              !accountContext?.userPreferences.enableCopilot || disableActions
            }
          />

          <View className="flex flex-row gap-x-1">
            <Button
              variant="ghost"
              size="icon"
              leftIcon={<ThumbsUp />}
              disabled={
                !accountContext?.userPreferences.enableCopilot || disableActions
              }
              onPress={() => {
                appInsights.trackEvent({
                  name: "fusion_copilot_feedback",
                  properties: {
                    feedback: "thumbs_up",
                    context: contextName,
                    userNpub: accountContext?.userNpub,
                  },
                });
                Toast.show({
                  type: "success",
                  text2:
                    "Thank you for your feedback! Glad the insight was helpful.",
                });
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              leftIcon={<ThumbsDown />}
              disabled={
                !accountContext?.userPreferences.enableCopilot || disableActions
              }
              onPress={() => {
                appInsights.trackEvent({
                  name: "fusion_copilot_feedback",
                  properties: {
                    feedback: "thumbs_down",
                    context: contextName,
                    userNpub: accountContext?.userNpub,
                  },
                });

                Toast.show({
                  type: "success",
                  text2: "Thank you for your feedback! It helps us improve.",
                });
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
