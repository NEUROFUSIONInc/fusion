import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

import { Button } from "../button";
import { InfoCircle, LeftArrow } from "../icons";

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
        leftIcon={<InfoCircle />}
        onPress={() => {
          // TODO: pop up model for Fusion bot
        }}
      />
    </View>
  );
};
