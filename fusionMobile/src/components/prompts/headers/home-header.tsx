import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { Button } from "../../button";
import { Person, Settings } from "../../icons";

import { AccountContext } from "~/contexts";

export const HomeHeader = () => {
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation<any>();

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      {/* TODO: add change username if set */}
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Person />}
        onPress={() => {
          navigation.navigate("AccountPage");
        }}
      />

      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Settings />}
        onPress={() => {
          navigation.navigate("SettingsPage");
        }}
      />
    </View>
  );
};
