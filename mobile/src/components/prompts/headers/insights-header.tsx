import React, { useContext } from "react";
import { View } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { Button } from "~/components/button";
import { ChevronDown } from "~/components/icons";
import { Streaks } from "~/components/streaks";
import { InsightContext } from "~/contexts";

export const InsightsHeader = () => {
  const insightContext = useContext(InsightContext);

  const insightLabels = {
    day: "Daily",
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <ContextMenu
        actions={[
          { title: "Daily" },
          { title: "Weekly" },
          { title: "Monthly" },
        ]}
        onPress={(e) => {
          if (e.nativeEvent.index === 0) {
            insightContext?.setInsightPeriod("day");
          } else if (e.nativeEvent.index === 1) {
            insightContext?.setInsightPeriod("week");
          } else if (e.nativeEvent.index === 2) {
            insightContext?.setInsightPeriod("month");
          }
        }}
        dropdownMenuMode
        title="Choose Insights Period"
      >
        {/* <View style={styles.yourOwnStyles} /> */}
        {/* <Text>Press me</Text> */}
        <Button
          variant="ghost"
          size="icon"
          rightIcon={<ChevronDown />}
          title={insightLabels[insightContext?.insightPeriod!]}
          textSize="bold"
        />
      </ContextMenu>
      <Streaks />
    </View>
  );
};
