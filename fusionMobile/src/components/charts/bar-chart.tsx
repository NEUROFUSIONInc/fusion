import dayjs from "dayjs";
import { BarChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import React, { FC, useRef } from "react";
import { View } from "react-native";
import SvgChart, { SVGRenderer } from "wrn-echarts/svgChart";

echarts.use([SVGRenderer, BarChart, GridComponent]);

export interface BarChartProps {
  seriesData: any[];
  startDate: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  timePeriod: "day" | "week" | "month";
}

export const FusionBarChart: FC<BarChartProps> = ({
  seriesData,
  startDate,
  endDate,
  timePeriod,
}) => {
  const svgChartRef = useRef(null);

  React.useEffect(() => {
    const chartOptions = {
      xAxis: {
        type: "time",
        gap: true,
        axisLabel: {
          formatter: (value: any) => {
            if (timePeriod === "day") {
              return dayjs(value).format("ha");
            } else if (timePeriod === "week") {
              return dayjs(value).format("ddd");
            } else if (timePeriod === "month") {
              return dayjs(value).format("D");
            }
          },
        },
        min: () => startDate.startOf(timePeriod).valueOf(),
        max: () => startDate.endOf(timePeriod).valueOf(),
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
        type: "value",
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
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#7a44cf",
          },
        },
      ],
    };

    let chart: echarts.ECharts;

    if (svgChartRef.current) {
      chart = echarts.init(svgChartRef.current, "light", {
        renderer: "svg",
        width: 400,
        height: 300,
      });
      console.log(JSON.stringify(chartOptions));
      chart.setOption(chartOptions);
    }

    return () => chart?.dispose();
  }, [seriesData]);

  return (
    <View className="flex w-fit">
      <SvgChart ref={svgChartRef} />
    </View>
  );
};