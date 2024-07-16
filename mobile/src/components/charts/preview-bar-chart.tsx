import { SvgChart, SVGRenderer } from "@wuba/react-native-echarts";
import { BarChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import React, { FC, useRef } from "react";

import type { BarChartProps } from "./bar-chart";

echarts.use([SVGRenderer, BarChart, GridComponent]);

export const FusionHealthBarChart: FC<BarChartProps> = ({
  seriesData,
  startDate,
  endDate,
  timePeriod,
}) => {
  const svgChartRef = useRef(null);

  React.useEffect(() => {
    const chartOptions = {
      animation: true,
      animationDuration: 500,
      xAxis: {
        show: false,
        type: "time",
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: false,
          lineStyle: {
            width: 0,
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          data: seriesData,
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#7a44cf",
            borderRadius: [2, 2, 0, 0],
          },
        },
      ],
    };

    let chart: echarts.ECharts;

    if (svgChartRef.current) {
      chart = echarts.init(svgChartRef.current, "light", {
        renderer: "svg",
        width: 120,
        height: 100,
      });
      chart.setOption(chartOptions);
    }

    return () => chart?.dispose();
  }, [seriesData]);

  return <SvgChart ref={svgChartRef} />;
};
