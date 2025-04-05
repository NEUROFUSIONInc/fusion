import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";

import { ProcessedHealthData } from "~/@types";
import { Button, CopilotTrigger } from "~/components";
import { IS_IOS } from "~/config";
import { AccountContext } from "~/contexts";
import { appInsights, buildHealthDataset, processHealthData } from "~/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: number;
}

export const ChatScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation();

  const [messages, setMessages] = React.useState<ChatMessageProps[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [healthData, setHealthData] =
    React.useState<ProcessedHealthData | null>(null);

  React.useEffect(() => {
    // Track page view
    appInsights.trackPageView({
      name: "Chat",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    // make data request for prompts/responses and biosignals
    const fetchHealthData = async () => {
      try {
        const data = await buildHealthDataset(
          dayjs().subtract(1, "months"),
          dayjs()
        );

        // Process health data to calculate summary statistics
        const processedData = processHealthData(data);
        setHealthData(processedData);
      } catch (error) {
        console.error("Error fetching health data:", error);
        setHealthData(null);
      }
    };

    fetchHealthData();
  }, []);

  const sendMessageToServer = async (messageText: string) => {
    setLoading(true);

    let fusionBackendUrl = "";
    if (Constants.expoConfig?.extra) {
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }

    try {
      const response = await axios.post<{ status: string; response: string }>(
        `${fusionBackendUrl}/api/chat`,
        {
          message: messageText,
          healthData,
          messages: messages.map((msg) => ({
            content: msg.message,
            role: msg.isUser ? "user" : "assistant",
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${accountContext?.userApiToken}`,
          },
        }
      );

      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          {
            message: response.data.response,
            isUser: false,
            timestamp: dayjs().unix(),
          },
        ]);

        // Track successful chat response
        appInsights.trackEvent({
          name: "chat_response_received",
          properties: {
            userNpub: accountContext?.userNpub,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add fallback response in case of error
      setMessages((prev) => [
        ...prev,
        {
          message:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: dayjs().unix(),
        },
      ]);

      // Track error
      appInsights.trackEvent({
        name: "chat_response_error",
        properties: {
          userNpub: accountContext?.userNpub,
          error: JSON.stringify(error),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = async () => {
    if (input.trim() === "" || loading) return;

    const userMessage = {
      message: input,
      isUser: true,
      timestamp: dayjs().unix(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Track user message sent
    appInsights.trackEvent({
      name: "chat_message_sent",
      properties: {
        userNpub: accountContext?.userNpub,
        messageLength: currentInput.length,
      },
    });

    await sendMessageToServer(currentInput);
  };

  const handleSuggestionPress = async (suggestion: string) => {
    if (loading) return;

    const userMessage = {
      message: suggestion,
      isUser: true,
      timestamp: dayjs().unix(),
    };

    setMessages([userMessage]);

    // Track suggestion used
    appInsights.trackEvent({
      name: "chat_suggestion_used",
      properties: {
        userNpub: accountContext?.userNpub,
        suggestion,
      },
    });

    await sendMessageToServer(suggestion);
  };

  const showConsentPrompt = () => {
    if (accountContext?.userLoading) return false;
    return !accountContext?.userPreferences.enableCopilot;
  };

  return (
    <View className="h-full w-full bg-dark px-5">
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={IS_IOS ? 130 : 0}
        className="h-full bg-dark"
      >
        <TouchableWithoutFeedback className="flex-[0.7]">
          {/* Chat Messages */}
          <ScrollView
            className="flex-1"
            ref={scrollViewRef}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          >
            {/* Messages will go here */}
            {messages.map((message, index) => (
              <View key={`${index}-${message.timestamp}`}>
                <View
                  className={`flex-row items-center p-4 rounded-md m-0.5 my-2 w-3/4
            ${message.isUser ? "ml-auto bg-secondary" : "bg-secondary-900"}`}
                >
                  <Text className="text-white font-sans whitespace-pre-wrap">
                    {
                      message.message
                        .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
                        .replace(/\*(.*?)\*/g, "$1") // Italic
                        .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Links
                        .replace(/#{1,6}\s(.*)/g, "$1") // Headers
                        .replace(/`{3}(.*?)`{3}/g, "$1") // Code blocks
                        .replace(/`(.*?)`/g, "$1") // Inline code
                        .replace(/^\s*[-*+]\s(.*)$/gm, "$1") // Lists
                    }
                  </Text>
                </View>
                <Text
                  className={`text-white/50 font-sans ${
                    message.isUser ? "ml-auto" : ""
                  }`}
                >
                  {dayjs(message.timestamp * 1000).format("h:mma")}
                </Text>
              </View>
            ))}

            {/* Loading indicator */}
            {loading && (
              <View className="items-center my-4">
                <ActivityIndicator color="#00FF00" />
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Copilot consent prompt */}
        {showConsentPrompt() && (
          <CopilotTrigger
            title="Enable Fusion Copilot"
            summaryText="To use chat features, you need to enable Fusion Copilot in settings."
            disableActions
            contextName="chat"
          >
            <View className="px-5 pb-4">
              <Button
                onPress={() => {
                  navigation.navigate("SettingsPage");
                }}
                title="Go to Settings"
                fullWidth
                variant="outline"
              />
            </View>
          </CopilotTrigger>
        )}

        {/* Suggestions for conversation, based on what we know */}
        {messages.length === 0 && !showConsentPrompt() && (
          <View className="mb-4">
            <Text className="text-white font-sans-bold text-lg mb-3">
              Let's chat. What would you like to know?
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ConversationCard
                title="Health Insights"
                text="What patterns do you see in my health data?"
                onPress={() =>
                  handleSuggestionPress(
                    "What patterns do you see in my health data?"
                  )
                }
              />
              <ConversationCard
                title="Daily Tips"
                text="What can I do to improve my wellbeing today?"
                onPress={() =>
                  handleSuggestionPress(
                    "What can I do to improve my wellbeing today?"
                  )
                }
              />
              <ConversationCard
                title="Progress Check"
                text="How am I doing compared to last month?"
                onPress={() =>
                  handleSuggestionPress(
                    "How am I doing compared to last month?"
                  )
                }
              />
              <ConversationCard
                title="Just Chatting"
                text="What's on your mind today?"
                onPress={() =>
                  handleSuggestionPress("What's on your mind today?")
                }
              />
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View className="flex flex-row items-center bg-secondary-900 rounded-md mt-auto mb-2 p-4 gap-x-2">
          <TextInput
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-white font-sans h-full"
            multiline
            value={input}
            onChangeText={(text) => setInput(text)}
            editable={!loading && !showConsentPrompt()}
          />
          <TouchableOpacity
            onPress={handleMessageSubmit}
            disabled={input.trim() === "" || loading || showConsentPrompt()}
          >
            <Text
              className={`font-sans ${
                input.trim() === "" || loading || showConsentPrompt()
                  ? "text-gray-500"
                  : "text-lime"
              }`}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// Conversation suggestion card component
interface ConversationCardProps {
  title: string;
  text: string;
  onPress: () => void;
}

const ConversationCard = ({ title, text, onPress }: ConversationCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-secondary-900 rounded-lg p-4 mr-3 w-48"
    >
      <Text className="text-white font-sans-bold mb-1">{title}</Text>
      <Text className="text-white/70 font-sans text-sm">{text}</Text>
    </TouchableOpacity>
  );
};
