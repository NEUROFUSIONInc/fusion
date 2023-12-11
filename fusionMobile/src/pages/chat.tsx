import dayjs from "dayjs";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Screen } from "~/components";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: number;
}

export const ChatScreen = () => {
  const [messages, setMessages] = React.useState<ChatMessageProps[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // if the user hasn't subscribed to copilot, ask then to do so.
  }, []);

  return (
    <Screen>
      {/* Chat Messages */}
      <ScrollView className="flex-1 bg-black">
        {/* Messages will go here */}
        {messages.map((message) => (
          <>
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
          </>
        ))}
      </ScrollView>

      {/* Suggestions for conversation, based on what we know */}

      {/* Input Area */}
      <View
        className="
          flex-row items-center p-4 bg-secondary-900 rounded-md
          m-0.5 my-2"
      >
        <TextInput
          placeholder="Type in your message..."
          placeholderTextColor="#9ca3af"
          className="flex-1 text-white rounded-md font-sans"
          multiline
          value={input}
          onChangeText={(text) => setInput(text)}
        />
        <TouchableOpacity
          className="ml-4 rounded-md"
          onPress={() => {
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
          }}
        >
          <Text className="text-lime font-sans">Send</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};
