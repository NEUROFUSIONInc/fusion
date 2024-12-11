import { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";

import { NeuroFusionParsedEEG } from "~/services/integrations/muse.service";
import dayjs from "dayjs";

interface SignalViewerProps {
  rawBrainwaves: NeuroFusionParsedEEG[];
  channelNames: string[];
  rangeMicrovolts: number;
}

export const SignalViewer: React.FC<SignalViewerProps> = ({ rawBrainwaves, channelNames, rangeMicrovolts = 50 }) => {
  const echartsRef = useRef<any>(null);

  const getOption = () => ({
    title: {
      text: "EEG Channels",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: channelNames,
      orient: "vertical",
      right: 10,
      top: "middle",
      title: {
        text: "Channel Names",
      },
    },
    grid: {
      right: "15%",
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      name: "Time",
      splitNumber: 10,
      axisLabel: {
        formatter: (value: number) => {
          return dayjs(value).format("HH:mm:ss");
        },
      },
      minInterval: 1000, // Force 1 second intervals
    },
    yAxis: {
      type: "value",
      name: "Amplitude (uV)",
      min: -rangeMicrovolts,
      max: rangeMicrovolts,
    },
    series: channelNames.map((channelName) => ({
      name: channelName,
      type: "line",
      data: rawBrainwaves
        .sort((a, b) => a.unixTimestamp - b.unixTimestamp)
        .map((item) => [item.unixTimestamp, item[channelName]]),
      showSymbol: false,
    })),
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
      },
    ],
  });

  return (
    <div>
      <ReactEcharts
        ref={echartsRef}
        option={getOption()}
        style={{ height: "500px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};
