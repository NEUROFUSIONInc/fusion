import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
import { ProgressBar } from "react-native-paper";
import Animated from "react-native-reanimated";

import { ResponseTextItem } from "../response-text-item";

import { FusionBarChart } from "./bar-chart";
import { FusionLineChart } from "./line-chart";

import { Prompt } from "~/@types";
import { AccountContext } from "~/contexts/account.context";
import { promptService } from "~/services";
import {
  appInsights,
  convertValueToNumber,
  maskPromptId,
  updateTimestampToMs,
} from "~/utils";

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
  const [additionalNotes, setAdditionalNotes] = useState<any[]>([]); // [timestamp, note]
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(true);
  const toggleAdditionalNotes = () => {
    setShowAdditionalNotes(!showAdditionalNotes);
  };
  const accountContext = useContext(AccountContext);

  useEffect(() => {
    // get the prompt responses
    // filter by time period
    // generate the chart options
    setAdditionalNotes([]);
    setShowAdditionalNotes(true);
    (async () => {
      const res = await promptService.getPromptResponses(prompt.uuid);

      if (!res) {
        setChartData([]);
        appInsights.trackEvent(
          {
            name: "insight_loaded",
          },
          {
            identifier: await maskPromptId(prompt.uuid),
            startDate,
            endDate,
            timePeriod,
            response_count: 0,
            userNpub: accountContext?.userNpub,
          }
        );
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

        // get any additionalNotes
        const additionalNotes = res
          .filter((response) => {
            const responseTimestamp = updateTimestampToMs(
              response.responseTimestamp
            );

            return (
              dayjs(responseTimestamp).isAfter(startDate) &&
              dayjs(responseTimestamp).isBefore(startDate.endOf(timePeriod)) &&
              response.additionalMeta?.note
            );
          })
          .map((d) => {
            return [
              updateTimestampToMs(d.responseTimestamp),
              d.additionalMeta?.note,
            ];
          });

        if (additionalNotes.length > 0) {
          setAdditionalNotes(additionalNotes);
        }

        appInsights.trackEvent(
          {
            name: "insight_loaded",
          },
          {
            identifier: await maskPromptId(prompt.uuid),
            startDate,
            endDate,
            timePeriod,
            response_count: filteredData.length,
            additional_notes_count: additionalNotes.length,
            userNpub: accountContext?.userNpub,
          }
        );

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
        } else if (
          prompt.responseType === "customOptions" &&
          filteredData.length > 0
        ) {
          // group responses by option so we have [option, percentage, count/totalEntries ]

          interface itemPair {
            [key: string]: number;
          }
          const customOptions: itemPair = {}; // {option: count}
          filteredData.forEach((d) => {
            // we allow multiple values so we need to split them
            const values = d[1].toString().split(";");
            values.forEach((value) => {
              if (customOptions[value]) {
                customOptions[value]++;
              } else {
                customOptions[value] = 1;
              }
            });
          });

          // total number of responses
          const totalResponses: number = Object.values(customOptions).reduce(
            (a: number, b: number) => a + b,
            0
          );

          // convert to array
          const customOptionsArr = Object.keys(customOptions).map((key) => {
            return [
              key,
              customOptions[key] / totalResponses,
              `${customOptions[key]}/${totalResponses}`,
            ];
          });

          setChartData(customOptionsArr);
        } else {
          setChartData(filteredData);
        }
      }
    })();
  }, [prompt, startDate, timePeriod]);

  return (
    <View className="flex-1">
      {chartData.length === 0 && (
        <View className="flex flex-col items-center justify-center h-52">
          <Text className="font-sans text-white text-base align-middle">
            No responses in this time period
          </Text>
        </View>
      )}

      {prompt.responseType === "yesno" && chartData.length > 0 && (
        <FusionLineChart
          seriesData={chartData}
          startDate={startDate}
          timePeriod={timePeriod}
        />
      )}

      {prompt.responseType === "number" && chartData.length > 0 && (
        <FusionBarChart
          seriesData={chartData}
          startDate={startDate}
          timePeriod={timePeriod}
        />
      )}

      {prompt.responseType === "customOptions" && chartData.length > 0 && (
        // get the counts per response
        <View className="flex flex-col w-full p-5">
          {chartData.map((entry) => {
            if (typeof entry[1] != "number") {
              return;
            }
            return (
              <View key={Math.random() * 1000} className="mb-3">
                <View className="flex flex-row justify-between mb-1">
                  <Text className="font-sans text-white text-base">
                    {entry[0]}
                  </Text>
                  <Text className="font-sans text-white opacity-50 text-base">
                    {entry[2]}
                  </Text>
                </View>

                <Animated.View>
                  <ProgressBar
                    progress={entry[1]}
                    color="#673AB7"
                    style={{
                      backgroundColor: "rgba(217,217,217,0.2)",
                      borderRadius: 10,
                      height: 8,
                    }}
                  />
                </Animated.View>
              </View>
            );
          })}
        </View>
      )}

      {prompt.responseType === "text" && chartData.length > 0 && (
        <View className="flex flex-col w-full p-5">
          {chartData.map((entry) => {
            return (
              <ResponseTextItem
                key={Math.random()}
                timestamp={entry[0]}
                textValue={entry[1]}
              />
            );
          })}
        </View>
      )}

      {additionalNotes.length > 0 && (
        // if there are additional options, display them here
        <View className="p-5">
          <View className="flex flex-row justify-end border-b-[1px] mb-3 pb-1 border-tint w-full">
            <Pressable onPress={toggleAdditionalNotes}>
              <Text className="text-base text-lime font-sans">
                {showAdditionalNotes ? "Hide" : "Show"} Additional Notes
              </Text>
            </Pressable>
          </View>

          {showAdditionalNotes && (
            <>
              {additionalNotes.map((entry) => {
                return (
                  <ResponseTextItem
                    key={Math.random()}
                    timestamp={entry[0]}
                    textValue={entry[1]}
                  />
                );
              })}
            </>
          )}
        </View>
      )}
    </View>
  );
};
