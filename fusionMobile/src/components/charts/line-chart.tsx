import dayjs from "dayjs";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import React, { FC, useRef } from "react";
import { View, Dimensions } from "react-native";
import SvgChart, { SVGRenderer } from "wrn-echarts/svgChart";

// yes/ no / no response
echarts.use([SVGRenderer, LineChart, GridComponent]);

export interface LineChartProps {
  seriesData: any[];
  startDate: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  timePeriod: "day" | "week" | "month" | "year";
}

export const FusionLineChart: FC<LineChartProps> = ({
  seriesData,
  startDate,
  timePeriod,
}) => {
  const svgChartRef = useRef(null);

  React.useEffect(() => {
    const chartOptions = {
      animation: true, // Enable animation
      animationDuration: 500,
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
          symbol: "circle",
          symbolSize: 5,
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
        width: Dimensions.get("window").width,
        height: 300,
      });
      chart.setOption(chartOptions);
    }

    return () => chart?.dispose();
  }, [seriesData]);

  return (
    <View>
      <SvgChart ref={svgChartRef} />
    </View>
  );
};
