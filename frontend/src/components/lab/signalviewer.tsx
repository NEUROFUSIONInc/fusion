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
  const [scale, setScale] = useState(rangeMicrovolts ?? 50);

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
      min: -scale,
      max: scale,
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
      <div className="flex justify-end">
        <select
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="mb-2 block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          aria-label="Select amplitude scale"
        >
          <option value={50}>±50 μV</option>
          <option value={100}>±100 μV</option>
          <option value={200}>±200 μV</option>
        </select>
      </div>
      <ReactEcharts
        ref={echartsRef}
        option={getOption()}
        style={{ height: "500px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};
