import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { Button } from "../button";
import { LeftArrow } from "../icons";

import { AccountContext } from "~/contexts";

export const AccountHeader = () => {
  const accountContext = React.useContext(AccountContext);
  const navigation = useNavigation<any>();

  return (
    <View className="flex flex-row p-5 flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow />}
        onPress={() => {
          navigation.navigate("HomePage");
        }}
      />
    </View>
  );
};
