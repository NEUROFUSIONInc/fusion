import { FC } from "react";
import { View } from "react-native";

import { Button } from "./button";
import { Streak } from "./icons";

export const Streaks: FC = () => {
  return (
    <View className="mr-3">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<Streak />}
        onPress={() => {
          console.log("show streak info");
        }}
        title="10"
      />
    </View>
  );
};
