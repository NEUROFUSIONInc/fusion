import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { black } from "tailwindcss/colors";

import { Button } from "./button";
import { FusionPreviewBarChart } from "./charts";
import { Reload } from "./icons";

import { FusionHealthDataset } from "~/@types";
import { AccountContext } from "~/contexts";
import { buildHealthDataset, connectAppleHealth, secondsToHms } from "~/utils";

export const HealthCard = () => {
  const navigation = useNavigation();
  const [healthDataset, setHealthDataset] = React.useState<
    FusionHealthDataset[]
  >([]);
  const accountContext = React.useContext(AccountContext);
  const [timePeriod, setTimePeriod] = React.useState<"day" | "week">("week");

  useEffect(() => {
    (async () => {
      if (accountContext?.userPreferences["enableHealthConnect"] === true) {
        await syncHealthData();
      }
    })();
  }, [accountContext]);

  const syncHealthData = async () => {
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
        dayjs().startOf("day").subtract(1, timePeriod).add(1, "day"),
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

  const handleNavigateToHealthDetail = () => {
    navigation.navigate("HealthPage");
  };

  return (
    <View className="w-full">
      <View className="flex flex-row justify-between">
        <Text className="p-5 text-base font-sans-bold text-white justify">
          Your Health
        </Text>

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
      </View>

      {/* display the steps data */}
      <View className="rounded-md mt-2 py-5 px-5 bg-secondary-900 active:opacity-90">
        <View className="flex flex-row items-center">
          <View className="mr-1">
            {/* Icon of a person running */}
            <Text className="text-white text-base">🏃</Text>
          </View>
          <Text className="font-sans flex flex-wrap text-white text-base mr-2">
            Steps
          </Text>
        </View>
        <View className="flex flex-row w-full items-end justify-between">
          <Text className="font-sans text-2xl text-white opacity-60">
            {(
              Math.floor(
                healthDataset.find(
                  (data) => data.date === dayjs().format("YYYY-MM-DD")
                )?.stepSummary.totalSteps ?? 0
              ) ?? "----"
            ).toLocaleString()}{" "}
            steps
          </Text>
          <View className="items-start h-16">
            <FusionPreviewBarChart
              seriesData={healthDataset.map((data) => [
                data.date,
                data.stepSummary.totalSteps,
              ])}
              startDate={dayjs().startOf(timePeriod)}
              timePeriod={timePeriod}
            />
          </View>
        </View>
      </View>

      {/* display the sleep data */}
      <View className="rounded-md mt-2 py-5 px-5 bg-secondary-900 active:opacity-90">
        <View className="flex flex-row items-center">
          <View className="mr-1">
            {/* Icon of a person sleeping */}
            <Text className="text-white text-base">💤</Text>
          </View>
          <Text className="font-sans flex flex-wrap text-white text-base mr-2">
            Sleep
          </Text>
        </View>

        <View className="flex flex-row w-full items-end justify-between">
          <View>
            <Text className="font-sans text-2xl text-white opacity-60">
              {secondsToHms(
                (() => {
                  const sleepData = healthDataset.find(
                    (data) => data.date === dayjs().format("YYYY-MM-DD")
                  )?.sleepSummary;

                  if (
                    !sleepData ||
                    Object.keys(sleepData.sources).length === 0
                  ) {
                    return 0;
                  }

                  // Get the first source
                  const firstSourceId = Object.keys(sleepData.sources)[0];
                  const firstSource = sleepData.sources[firstSourceId];
                  const isOura = firstSource.sourceName
                    .toLowerCase()
                    .includes("oura");

                  if (isOura) {
                    // For Oura, sum up core, rem, and deep sleep
                    return (
                      (firstSource.stages["CORE"] || 0) +
                      (firstSource.stages["REM"] || 0) +
                      (firstSource.stages["DEEP"] || 0)
                    );
                  } else {
                    // For other sources like Apple Health, use ASLEEP
                    return firstSource.stages["ASLEEP"] || 0;
                  }
                })()
              ) ?? "-- hrs -- mins"}
            </Text>
            {(() => {
              // Check if this is Oura data and show time in bed if it is
              const sleepData = healthDataset.find(
                (data) => data.date === dayjs().format("YYYY-MM-DD")
              )?.sleepSummary;

              if (!sleepData || Object.keys(sleepData.sources).length === 0) {
                return null;
              }

              const firstSourceId = Object.keys(sleepData.sources)[0];
              const firstSource = sleepData.sources[firstSourceId];
              const isOura = firstSource.sourceName
                .toLowerCase()
                .includes("oura");

              if (isOura && firstSource.stages["INBED"]) {
                return (
                  <Text className="font-sans text-sm text-white opacity-40">
                    Time in bed: {secondsToHms(firstSource.stages["INBED"])}
                  </Text>
                );
              }
              return null;
            })()}
          </View>
          <View className="items-start h-16">
            <FusionPreviewBarChart
              seriesData={healthDataset.map((data) => {
                const sleepData = data.sleepSummary;
                if (!sleepData || Object.keys(sleepData.sources).length === 0) {
                  return [data.date, 0];
                }

                // Get the first source
                const firstSourceId = Object.keys(sleepData.sources)[0];
                const firstSource = sleepData.sources[firstSourceId];
                const isOura = firstSource.sourceName
                  .toLowerCase()
                  .includes("oura");

                if (isOura) {
                  // For Oura, sum up core, rem, and deep sleep and convert to hours
                  const asleepSeconds =
                    (firstSource.stages["CORE"] || 0) +
                    (firstSource.stages["REM"] || 0) +
                    (firstSource.stages["DEEP"] || 0);
                  return [data.date, asleepSeconds / 3600];
                } else {
                  // For other sources like Apple Health, use ASLEEP
                  const asleepSeconds = firstSource.stages["ASLEEP"] || 0;
                  return [data.date, asleepSeconds / 3600]; // convert seconds to hours
                }
              })}
              startDate={dayjs().startOf(timePeriod)}
              timePeriod={timePeriod}
            />
          </View>
        </View>
      </View>

      {/* display the heart rate data */}
      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
    </View>
  );
};
