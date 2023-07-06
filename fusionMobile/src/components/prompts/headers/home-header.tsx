import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../button";
import { Person, Settings } from "../../icons";

import { UserAccount } from "~/@types";
import { nostrService } from "~/services";

export const HomeHeader = () => {
  const [nostrAccount, setNostrAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    (async () => {
      console.log("getting nostr account");
      const res = await nostrService.getNostrAccount();
      if (res) {
        setNostrAccount(res);
      } else {
        console.log("creating nostr account");
        const res = await nostrService.createNostrAccount();
        if (res) {
          setNostrAccount(res);
        }
      }
    })();
  }, []);

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Person />}
        onPress={() => console.log("nothing yet")}
      />
      <Text className="font-sans text-[25px] text-white">
        {nostrAccount?.npub.slice(0, 5) + ":" + nostrAccount?.npub.slice(-5)}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Settings />}
        onPress={() => console.log("nothing yet")}
      />
    </View>
  );
};
