import dayjs from "dayjs";
import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";

import { Screen } from "~/components";
import { buildHealthDataset } from "~/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: number;
}

export const ChatScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = React.useState<ChatMessageProps[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // TODO: if the user hasn't subscribed to copilot, ask them to do so.
    // if they haven't connected their health data ask them to connect also...
    // make data request for prompts/responses and biosignals
    const healthData = buildHealthDataset(
      dayjs().subtract(1, "months"),
      dayjs()
    );

    console.log(healthData);
  }, []);

  const handleMessageSubmit = () => {
    // Send message
    setMessages([
      ...messages,
      {
        message: input,
        isUser: true,
        timestamp: dayjs().unix(),
      },
    ]);
    setInput("");
  };

  return (
    <Screen>
      {/* Chat Messages */}
      <ScrollView
        className="flex-1 bg-black"
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {/* Messages will go here */}
        {messages.map((message) => (
          <View key={Math.random()}>
            <View
              className={`flex-row items-center p-4 rounded-md m-0.5 my-2 w-3/4
            ${message.isUser ? "ml-auto bg-secondary" : "bg-secondary-900"}`}
            >
              <Text className="text-white font-sans">{message.message}</Text>
            </View>
            <Text
              className={`text-white/50 font-sans ${
                message.isUser ? "ml-auto" : ""
              }`}
            >
              {dayjs(message.timestamp).format("h:mma")}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Suggestions for conversation, based on what we know */}
      {messages.length === 0 && (
        <>
          {/* we make a call based on the data we have and come up with question cards */}
          {/* if the user has no prompts/responses then ask what's top of mind */}
        </>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior="position"
        className="
           flex-1 flex-row items-center bg-secondary-900 rounded-md
          my-2 max-h-[10%] pl-4 pr-4"
        // {...(Platform.OS === "ios" ? { keyboardVerticalOffset: 100 } : {})
      >
        <TextInput
          placeholder="Message..."
          placeholderTextColor="#9ca3af"
          className="flex-1 text-white rounded-md font-sans"
          multiline
          value={input}
          onChangeText={(text) => setInput(text)}
        />
        <TouchableOpacity onPress={handleMessageSubmit}>
          <Text className="text-lime font-sans">Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
};
