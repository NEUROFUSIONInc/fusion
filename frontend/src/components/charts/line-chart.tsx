import dayjs from "dayjs";
import ReactEcharts from "echarts-for-react";
import React, { FC } from "react";
import { DisplayCategory, FusionQuestDataset } from "~/@types";

export interface LineChartProps {
  seriesData: FusionQuestDataset[];
  startDate: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  timePeriod: "day" | "week" | "month" | "year";
  category: DisplayCategory;
}

export const FusionLineChart: FC<LineChartProps> = ({ seriesData, startDate, timePeriod, category }) => {
  const [chartOptions, setChartOptions] = React.useState<any>({});

  React.useEffect(() => {
    // console.log(JSON.parse(seriesData[0].value) as FusionHealthDataset[]);
    const dates = seriesData[0].value.map((item) => item.date);
    console.log("dates", dates);
    const chartOptions = {
      animation: true, // Enable animation
      animationDuration: 500,
      xAxis: {
        type: "category",
        gap: true,
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(128, 128, 128, 0.1)", // Set the color of the grid lines
            width: 1, // Set the thickness of the grid lines
            type: "solid", // Set the style of the grid lines
          },
        },
      },
      yAxis: [{ type: "value", name: category.name, position: "left" }],
      series: seriesData.map((data) => ({
        name: data.userGuid,
        yAxisIndex: 0,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        itemStyle: {
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        },
        data: data.value.map((item) => [item.stepSummary.date, item.stepSummary.totalSteps]),
      })),
      legend: {
        data: seriesData.map((data) => data.userGuid),
        title: {
          text: "Participant",
        },
        orient: "horizontal", // Place the legend at the bottom
        bottom: 0, // Adjust the distance from the bottom
        type: "scroll", // Enable scrolling for the legend
        limit: 10, // Limit the number of items displayed in the legend
      },
    };

    setChartOptions(chartOptions);
  }, [seriesData]);

  return (
    <div className="p-5">
      <ReactEcharts option={chartOptions} style={{ height: "500px", width: "100%" }} opts={{ renderer: "canvas" }} />
    </div>
  );
};
