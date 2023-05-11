/**
 * FusionCharts JavaScript Library - Chart Component
 */

// let's get this bread!
import React, { useRef, useEffect } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
// import { SVGRenderer, SkiaChart } from "wrn-echarts";
import dayjs from "dayjs";
import SvgChart, { SVGRenderer } from "wrn-echarts/svgChart";
import { updateTimestampToMs } from "../utils/index";
import { View, StyleSheet, Text } from "react-native";
import SwitchSelector from "react-native-switch-selector";
import { MaterialCommunityIcons } from "@expo/vector-icons";

echarts.use([SVGRenderer, LineChart, GridComponent]);

export function FusionChart({ data, prompt }) {
  const svgChartRef = useRef(null);

  const timePeriodOptions = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  const [timePeriod, setTimePeriod] = React.useState("week");

  const [startDate, setStartDate] = React.useState(dayjs());

  const [startDateText, setStartDateText] = React.useState(null);

  useEffect(() => {
    // set the start date based on the time period
    switch (timePeriod) {
      case "day":
        setStartDate(startDate.startOf("day"));
        break;

      case "week":
        setStartDate(startDate.startOf("week"));
        break;

      case "month":
        setStartDate(startDate.startOf("month"));
        break;
    }
  }, [timePeriod]);

  useEffect(() => {
    switch (timePeriod) {
      case "day":
        setStartDateText(startDate.format("dddd, MMMM D"));
        break;
      case "week":
        setStartDateText(
          `${startDate.format("MMMM D")} - ${startDate
            .endOf("week")
            .format("MMMM D")}`
        );
        break;
      case "month":
        setStartDateText(startDate.format("MMMM, YYYY"));
        break;
    }
  }, [startDate]);

  useEffect(() => {
    const seriesData = data
      .filter(d => {
        const responseTimestamp = updateTimestampToMs(d.responseTimestamp);
        switch (timePeriod) {
          case "day":
            return (
              dayjs(responseTimestamp).isAfter(startDate) &&
              dayjs(responseTimestamp).isBefore(startDate.endOf("day"))
            );
          case "week":
            return (
              dayjs(responseTimestamp).isAfter(startDate) &&
              dayjs(responseTimestamp).isBefore(startDate.endOf("week"))
            );
          case "month":
            return (
              dayjs(responseTimestamp).isAfter(startDate) &&
              dayjs(responseTimestamp).isBefore(startDate.endOf("month"))
            );
        }
      })
      .map(d => {
        return [updateTimestampToMs(d.responseTimestamp), d.value];
      });

    console.log(seriesData);

    // here we now build the values based on prompt settings
    const option = {
      xAxis: {
        type: "time",
        gap: true,
        axisLabel: {
          formatter: value => {
            if (timePeriod === "day") {
              return dayjs(value).format("ha");
            } else if (timePeriod === "week") {
              return dayjs(value).format("ddd");
            } else if (timePeriod === "month") {
              return dayjs(value).format("D");
            }
          },
        },
        min: () => {
          switch (timePeriod) {
            case "day":
              return startDate.startOf("day").valueOf();
            case "week":
              return startDate.startOf("week").valueOf();
            case "month":
              return startDate.startOf("month").valueOf();
          }
        },
        max: () => {
          switch (timePeriod) {
            case "day":
              return startDate.endOf("day").valueOf();
            case "week":
              return startDate.endOf("week").valueOf();
            case "month":
              return startDate.endOf("month").valueOf();
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(128, 128, 128, 0.1)", // Set the color of the grid lines
            width: 1, // Set the thickness of the grid lines
            type: "solid", // Set the style of the grid lines
          },
        },
      },
      yAxis: {
        type: "category",
        data: ["No", "Yes"],
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
        },
      },
      series: [
        {
          data: seriesData,
          type: "line",
          smooth: true,
          symbol: "none",
          itemStyle: {
            color: "#7a44cf",
          },
        },
      ],
    };

    let chart;

    if (svgChartRef.current) {
      chart = echarts.init(svgChartRef.current, "light", {
        renderer: "svg",
        width: 400,
        height: 300,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [startDate, timePeriod]);

  // TODO: compare with "last period" / "average" selector

  function updateStartDate(direction) {
    // direction is either 1 or -1
    switch (timePeriod) {
      case "day":
        setStartDate(startDate.add(direction, "day"));
        break;
      case "week":
        setStartDate(startDate.add(direction, "week"));
        break;
      case "month":
        setStartDate(startDate.add(direction, "month"));
        break;
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SwitchSelector
        options={timePeriodOptions}
        initial={1}
        onPress={value => setTimePeriod(value)}
        textColor={"#7a44cf"}
        selectedColor={"#fff"}
        buttonColor={"#7a44cf"}
        borderColor={"#7a44cf"}
        hasPadding
        borderRadius={5}
      />

      {/* date range selector */}
      <View style={styles.datePicker}>
        {/* and icon pointing left */}
        <MaterialCommunityIcons
          name="arrow-left-drop-circle"
          size={30}
          color={"#7a44cf"}
          onPress={() => updateStartDate(-1)}
        />
        {/* date - this should pop up a date selector */}
        <Text>{startDateText}</Text>
        {/* and icon pointing right */}
        <MaterialCommunityIcons
          name="arrow-right-drop-circle"
          size={30}
          color={"#7a44cf"}
          onPress={() => updateStartDate(1)}
        />
      </View>

      <SvgChart ref={svgChartRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  datePicker: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
