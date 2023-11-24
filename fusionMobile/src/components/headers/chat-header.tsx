import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

import { Button } from "../button";
import { Help, LeftArrow } from "../icons";

import { AccountContext } from "~/contexts";

export const ChatHeader = () => {
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation<any>();

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow />}
        onPress={() => {
          navigation.navigate("HomePage");
        }}
      />

      <Text className="font-sans text-base text-center text-white">
        Chat with Fusion
      </Text>

      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Help />}
        onPress={() => {
          // TODO: pop up model for Fusion bot
        }}
      />
    </View>
  );
};

{
  /* Header */
}
{
  /* <View style={tailwind("flex-row items-center p-4 bg-black")}>
  <TouchableOpacity style={tailwind("")}>
    <Text style={tailwind("text-white")}>←</Text>
  </TouchableOpacity>
  <Text style={tailwind("flex-1 text-center text-white")}>
    Chat with Fusion
  </Text>
  <TouchableOpacity style={tailwind("")}>
    <Text style={tailwind("text-white")}>i</Text>
  </TouchableOpacity>
</View>; */
}
