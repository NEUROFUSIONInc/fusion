import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, TouchableOpacity } from "react-native";

import { Chat } from "./icons";

export const ChatBubble = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="absolute bottom-4 right-4">
      <TouchableOpacity
        className="bg-[#3715D7] h-12 w-12 rounded-full flex items-center justify-center"
        onPress={() => {
          navigation.navigate("HomeNavigator", {
            screen: "ChatPage",
          });
        }}
      >
        <Chat />
      </TouchableOpacity>
    </View>
  );
};
