import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Screen } from "~/components";

export const ChatScreen = () => {
  return (
    <Screen>
      {/* Chat Messages */}
      <ScrollView className="flex-1 bg-black">
        {/* Messages will go here */}
      </ScrollView>
      {/* Input Area */}
      <View
        className="
          flex-row items-center p-4 bg-black border-t border-gray-800"
      >
        <TextInput
          placeholder="Type in your message..."
          placeholderTextColor="#9ca3af"
          className="flex-1 text-white bg-gray-800 p-2 rounded-md"
        />
        <TouchableOpacity className="ml-4 bg-blue-600 px-4 py-2 rounded-md">
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};
