import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

export const CloseBubble = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="absolute bottom-4 right-4">
      <TouchableOpacity
        className="bg-dark rounded-lg flex flex-row items-center justify-center"
        onPress={() => {
          navigation.navigate("HomeNavigator", {
            screen: "HomePage",
          });
        }}
      >
        <Text className="font-sans text-white p-4">Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};
