import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";

import { FusionBarChart } from "./bar-chart";
import { FusionLineChart } from "./line-chart";

import { Prompt } from "~/@types";
import { promptService } from "~/services";
import { convertValueToNumber, updateTimestampToMs } from "~/utils";

export interface ChartContainerProps {
  prompt: Prompt;
  startDate: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  timePeriod: "day" | "week" | "month" | "year";
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  prompt,
  startDate,
  endDate = null,
  timePeriod,
}) => {
  // on load, get the prompt responses...
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // get the prompt responses
    (async () => {
      const res = await promptService.getPromptResponses(prompt.uuid);

      if (!res) {
        setChartData([]);
      } else {
        // sort events
        res.sort((a, b) => {
          return a.triggerTimestamp - b.triggerTimestamp;
        });

        // filter by startDate
        const filteredData = res
          .filter((response) => {
            const responseTimestamp = updateTimestampToMs(
              response.responseTimestamp
            );

            return (
              dayjs(responseTimestamp).isAfter(startDate) &&
              dayjs(responseTimestamp).isBefore(startDate.endOf(timePeriod))
            );
          })
          .map((d) => {
            return [updateTimestampToMs(d.responseTimestamp), d.value];
          });

        // TODO: make this better pls
        if (prompt.responseType === "number" && filteredData.length > 0) {
          // group the responses by startTimestamp of the day
          const dailyAverage: any = []; // [startTimestamp, average]
          // just make it an object
          const dailyAverageObj: any = {};

          filteredData.forEach((d) => {
            const day = dayjs(d[0]).startOf("day").valueOf();
            const value = convertValueToNumber(d[1]);

            console.log(day, value);
            if (dailyAverageObj[day]) {
              dailyAverageObj[day].push(value);
            } else {
              dailyAverageObj[day] = [value];
            }
          });

          console.log(dailyAverageObj);

          // calculate the average
          Object.keys(dailyAverageObj).forEach((key) => {
            const average =
              dailyAverageObj[key].reduce((a: number, b: number) => a + b, 0) /
              dailyAverageObj[key].length;
            dailyAverage.push([Number(key), average]);
          });

          setChartData(dailyAverage);
          return;
        }

        setChartData(filteredData);
      }
    })();
    // filter by time period
    // generate the chart options
  }, [prompt, startDate, timePeriod]);

  return (
    <>
      {chartData.length === 0 && (
        <View className="flex flex-col items-center justify-center h-52">
          <Text className="font-sans text-white text-base align-middle">
            No responses in this time period
          </Text>
        </View>
      )}

      {/* // if there are responses, then render the chart based on type */}
      {prompt.responseType === "yesno" && chartData.length > 0 ? (
        <FusionLineChart
          seriesData={chartData}
          startDate={startDate}
          timePeriod="week"
        />
      ) : null}

      {prompt.responseType === "number" && chartData.length > 0 ? (
        <FusionBarChart
          seriesData={chartData}
          startDate={startDate}
          timePeriod="week"
        />
      ) : null}

      {/* {prompt.responseType === "customOptions" && chartData.length > 0 ? (
          <FusionBarChart
            seriesData={chartData}
            startDate={startDate}
            timePeriod="week"
          />
        ) : null} */}

      {prompt.responseType === "text" && chartData.length > 0 ? (
        <ScrollView className="flex flex-col w-full p-5 h-52">
          {chartData.map((entry) => {
            return (
              <View className="pb-3 mb-3 border-b-2 border-tint">
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="font-sans flex flex-wrap text-white text-base font-medium"
                >
                  {entry[1]}
                </Text>
                <View className="flex flex-row gap-x-2 items-center mt-1">
                  <Text className="font-sans text-sm text-white opacity-60">
                    {dayjs(entry[0]).format("dd MMM D, YYYY")}
                  </Text>
                  <View className="w-1 h-1 bg-white opacity-60" />
                  <Text className="font-sans text-sm text-white opacity-60">
                    {dayjs(entry[0]).format("h:mma")}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : // display the text
      null}
    </>
  );
};
