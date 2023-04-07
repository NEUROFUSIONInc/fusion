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

echarts.use([SVGRenderer, LineChart, GridComponent]);

export function FusionChart({ data, prompt }) {
  const svgChartRef = useRef(null);

  useEffect(() => {
    // const formattedData = sortedEvents.map((d) => {
    //   const value = d.event.value === "Yes" ? 1 : -1;
    //   return { timestamp: d.startTimestamp, value: value };
    // });

    // console.log(formattedData);

    // let cumulativeSum = 0;
    // const seriesData = formattedData.map((d) => {
    //   cumulativeSum += d.value;
    //   return [d.timestamp, cumulativeSum];
    // });

    const seriesData = data.map((d) => {
      return [d.responseTimestamp, d.value];
    });

    console.log(seriesData);
    const option = {
      xAxis: {
        type: "time",
        gap: true,
      },
      yAxis: {
        type: "category",
        data: ["No", "Yes"],
      },
      series: [
        {
          data: seriesData,
          type: "line",
          smooth: true,
          symbol: "none",
        },
      ],
    };

    let chart;

    if (svgChartRef.current) {
      chart = echarts.init(svgChartRef.current, "light", {
        renderer: "svg",
        width: 400,
        height: 400,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, []);

  return <SvgChart ref={svgChartRef} />;
}
