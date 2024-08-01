import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { State } from "react-native-gesture-handler";

import { CalendarPicker, FusionBarChart, Screen } from "~/components";
import { AccountContext, InsightContext } from "~/contexts";
import { RouteProp } from "~/navigation";
import { appInsights } from "~/utils";

export function HealthScreen() {
  const route = useRoute<RouteProp<"InsightsPage">>();

  const insightContext = useContext(InsightContext);
  const routeChartPeriod = route.params?.chartPeriod;
  let routeStartDate = route.params?.startDate;

  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "HealthDetails",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });
  }, []);

  //TODO: convert occurence to start of internal state or context controlled state for time period
  const [chartStartDate, setChartStartDate] = React.useState<dayjs.Dayjs>(
    dayjs().startOf("week")
  );

  // TODO: this is conflicting with the values the user sets..
  useEffect(() => {
    //TODO: convert occurence to start of internal state or context controlled state for time period
    setChartStartDate(dayjs().startOf("week"));
    if (routeStartDate) {
      setChartStartDate(routeStartDate);
      routeStartDate = undefined;
    }
  }, []);

  const onHandlerStateChange = (event: {
    nativeEvent: { state: number; translationX: number };
  }) => {
    if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX < -50
    ) {
      // Check if the swipe is left (translationX is less than -50)
      // inspiration is similar to the onHandlerstateChange in insights page
      //   setChartStartDate(chartStartDate.add(1, insightContext!.insightPeriod));
    } else if (
      event.nativeEvent.state === State.END &&
      event.nativeEvent.translationX > 50
    ) {
      // Check if the swipe is left (translationX is less than -50)
      // inspiration is similar to the onHandlerstateChange in insights page
      //   setChartStartDate(
      //     chartStartDate.subtract(1, insightContext!.insightPeriod)
      //   );
    }
  };
  const healthData = [
    [1720609200000, Math.floor(Math.random() * 100)],
    [1720695600000, Math.floor(Math.random() * 15)],
    [1720782000000, Math.floor(Math.random() * 85)],
    [1720868400000, Math.floor(Math.random() * 25)],
    [1720954800000, Math.floor(Math.random() * 60)],
    [1721041200000, Math.floor(Math.random() * 20)],
    [1721127600000, Math.floor(Math.random() * 50)],
  ];

  return (
    <Screen>
      <CalendarPicker
        selectedDate={chartStartDate}
        setSelectedDate={setChartStartDate}
      />
      <View>
        <FusionBarChart
          seriesData={healthData}
          startDate={chartStartDate}
          timePeriod="week"
          // timePeriod={insightContext!.insightPeriod}
        />
      </View>
    </Screen>
  );
}
