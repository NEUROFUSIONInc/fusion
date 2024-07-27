import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { Button } from "../button";
import { ChevronDown, LeftArrow } from "../icons";

export const HealthHeader = () => {
  const navigation = useNavigation();
  const [timePeriod, setTimePeriod] = React.useState<"day" | "week">("day");

  const insightLabels = {
    day: "Daily",
    week: "Weekly",
  };

  return (
    <View className="flex flex-row p-5 justify-between items-center flex-nowrap bg-dark">
      <View className="flex-row gap-3 items-center">
        <Button
          variant="ghost"
          size="icon"
          leftIcon={<LeftArrow width={20} height={20} />}
          onPress={() => navigation.goBack()}
        />
        <ContextMenu
          actions={[{ title: "Daily" }, { title: "Weekly" }]}
          onPress={(e) => {
            if (e.nativeEvent.index === 0) {
              setTimePeriod("day");
            } else if (e.nativeEvent.index === 1) {
              setTimePeriod("week");
            }
          }}
          dropdownMenuMode
          title="Choose Health Period"
        >
          <Button
            variant="ghost"
            size="icon"
            rightIcon={<ChevronDown />}
            title={insightLabels[timePeriod]}
          />
        </ContextMenu>
      </View>
      <Text className="text-base leading-5 text-white">Health</Text>
      <View className="w-[30%]" />
    </View>
  );
};
