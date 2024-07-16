import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { black } from "tailwindcss/colors";

import { Button } from "./button";
import { FusionPreviewBarChart } from "./charts";
import { Reload } from "./icons";

/**
 *
 */

import { AccountContext } from "~/contexts";
import {
  buildHealthDataset,
  connectAppleHealth,
  FusionHealthDataset,
  secondsToHms,
} from "~/utils";

export const HealthCard = () => {
  const navigation = useNavigation();
  const [healthDataset, setHealthDataset] = React.useState<
    FusionHealthDataset[]
  >([]);
  const accountContext = React.useContext(AccountContext);
  const [timePeriod, setTimePeriod] = React.useState<"day" | "week">("day");

  useEffect(() => {
    console.log("user loading", accountContext?.userLoading);
    console.log("user preferences", accountContext?.userPreferences);

    (async () => {
      if (accountContext?.userPreferences["enableHealthConnect"] === true) {
        await syncHealthData();
      }
    })();
  }, [accountContext]);

  const syncHealthData = async () => {
    // reuse functions from settings page
    const res = await connectAppleHealth();
    // update the user preferences if not set and user has connected health
    if (
      res === true &&
      accountContext?.userPreferences["enableHealthConnect"] === false
    ) {
      accountContext?.setUserPreferences({
        ...accountContext.userPreferences,
        enableHealthConnect: true,
      });
    }
    console.log("health connect response: ", res);

    // build the health dataset
    try {
      const res = await buildHealthDataset(
        dayjs().startOf("day").subtract(1, timePeriod),
        dayjs()
      );

      if (res) {
        console.log("health dataset entries:", res.length);
        console.log("health data", JSON.stringify(res));
        setHealthDataset(res);
      }
    } catch (error) {
      console.error("Failed to sync health data", error);
    }
  };

  const toggleTimePeriod = () => {
    if (timePeriod === "day") {
      setTimePeriod("week");
    } else {
      setTimePeriod("day");
    }
  };

  /**
   * TODO: Implement health detail view for each health section
   */

  // dummy health data, this would be changed depending on the time period and return all the data based on the time period till the particular day or hour
  const healthData = [
    [1720609200000, 100],
    [1720695600000, 42],
    [1720782000000, 22],
    [1720868400000, 2],
    [1720954800000, 30],
    [1721041200000, 120],
    [1721127600000, 75],
  ];

  const handleNavigateToHealthDetail = () => {
    navigation.navigate("HealthPage");
  };

  return (
    <View className="w-full">
      <View className="flex flex-row justify-between">
        <Text className="text-white font-sans text-lg p-5">Health</Text>

        {/* sync button */}
        {accountContext?.userLoading === false &&
          accountContext?.userPreferences["enableHealthConnect"] === false && (
            <Button
              title="Sync"
              className="m-0 px-4 py-2 self-center"
              rounded
              onPress={syncHealthData}
              rightIcon={<Reload color={black} />}
            />
          )}

        {/* time period toggle */}
        {accountContext?.userLoading === false &&
          accountContext?.userPreferences["enableHealthConnect"] === true && (
            <Pressable
              className="rounded-md m-0 self-center py-2 px-4 bg-secondary-900 active:opacity-90"
              onPress={toggleTimePeriod}
            >
              <Text className="font-sans text-base text-[#c4ff81] opacity-60 self-center h-contain">
                {timePeriod === "day" ? "Today" : "This Week"}
              </Text>
            </Pressable>
          )}
      </View>

      {/* display the steps data */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleNavigateToHealthDetail}
      >
        <View className="rounded-md mt-2 py-5 px-5 bg-secondary-900 active:opacity-90">
          <Text className="font-sans flex flex-wrap text-white text-base mr-2">
            Steps
          </Text>
          <View className="flex flex-row w-full items-end justify-between">
            <Text className="font-sans text-base text-white opacity-60">
              {Math.floor(
                healthDataset.find(
                  (data) => data.date === dayjs().format("YYYY-MM-DD")
                )?.stepSummary.totalSteps ?? 0
              ) ?? "----"}{" "}
              steps
            </Text>
            <View className="items-start h-16">
              <FusionPreviewBarChart
                seriesData={healthData}
                startDate={dayjs().startOf(timePeriod)}
                timePeriod={timePeriod}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* display the sleep data */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleNavigateToHealthDetail}
      >
        <View className="rounded-md mt-2 py-5 px-5 bg-secondary-900 active:opacity-90">
          <Text className="font-sans flex flex-wrap text-white text-base mr-2">
            Sleep
          </Text>

          <View className="flex flex-row w-full items-end justify-between">
            <Text className="font-sans text-base text-white opacity-60">
              {secondsToHms(
                healthDataset.find(
                  (data) => data.date === dayjs().format("YYYY-MM-DD")
                )?.sleepSummary.duration!
              ) ?? "-- hrs -- mins"}
            </Text>
            <View className="items-start h-16">
              <FusionPreviewBarChart
                seriesData={healthData}
                startDate={dayjs().startOf(timePeriod)}
                timePeriod={timePeriod}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* display the heart rate data */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleNavigateToHealthDetail}
      >
        <View className="rounded-md mt-2 py-5 px-5 bg-secondary-900 active:opacity-90">
          <Text className="font-sans flex flex-wrap text-white text-base mr-2">
            Heart Rate
          </Text>
          <View className="flex flex-row w-full items-end justify-between">
            <Text className="font-sans text-base text-white opacity-60">
              {healthDataset.find(
                (data) => data.date === dayjs().format("YYYY-MM-DD")
              )?.heartRateSummary?.average ?? "--"}{" "}
              bpm
            </Text>
            <View className="items-start h-16">
              <FusionPreviewBarChart
                seriesData={healthData}
                startDate={dayjs().startOf(timePeriod)}
                timePeriod={timePeriod}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
