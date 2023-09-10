import React from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "../../button";
import { Person, Settings } from "../../icons";

import { AccountContext } from "~/contexts";

export const HomeHeader = () => {
  const accountContext = React.useContext(AccountContext);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Pressable
        className="flex flex-row vertical-center"
        onPress={() => {
          console.log(accountContext?.userNpub);
        }}
      >
        <Person />
        {/* TODO: change to fusion logo */}
        <Text className="font-sans text-base text-white text-[20px] ml-2">
          {accountContext?.userNpub.slice(0, 8) +
            ":" +
            accountContext?.userNpub.slice(-8)}
        </Text>
      </Pressable>
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Settings />}
        onPress={() => console.log("nothing yet")}
      />
    </View>
  );
};
