import { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";

import { NeuroFusionParsedEEG } from "~/services/integrations/muse.service";

interface SignalViewerProps {
  rawBrainwaves: NeuroFusionParsedEEG[];
  channelNames: string[];
}

export const SignalViewer: React.FC<SignalViewerProps> = ({ rawBrainwaves, channelNames }) => {
  const echartsRefs = useRef<any>([]);

  useEffect(() => {
    console.log("re-render");
    const syncZoom = (param: { chartId: string; batch: { start: any; end: any }[] }) => {
      if (!param.batch || param.batch.length === 0) return;

      const zoomedChart = echarts.getInstanceById(param.chartId);
      const { start, end } = param.batch[0];

      //@ts-ignore
      echartsRefs.current.forEach((echartRef) => {
        if (echartRef && echartRef.getEchartsInstance() !== zoomedChart) {
          echartRef.getEchartsInstance().dispatchAction({
            type: "dataZoom",
            start,
            end,
            xAxisIndex: 0,
          });
        }
      });
    };

    //@ts-ignore
    echartsRefs.current.forEach((echartRef) => {
      if (echartRef) {
        echartRef.getEchartsInstance().on("dataZoom", syncZoom);
      }
    });

    return () => {
      //@ts-ignore
      echartsRefs.current.forEach((echartRef) => {
        if (echartRef) {
          echartRef.getEchartsInstance().off("dataZoom", syncZoom);
        }
      });
    };
  }, [channelNames, rawBrainwaves]);

  const getOption = (channelName: string) => ({
    title: {
      text: `EEG Channel: ${channelName}`,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        show: false, // This will hide the x-axis labels
      },
    },
    yAxis: {
      type: "value",
      name: `${channelName} (uV)`,
    },
    series: [
      {
        name: channelName,
        type: "line",
        data: rawBrainwaves
          .sort((a, b) => a.unixTimestamp - b.unixTimestamp)
          .map((item) => [item.unixTimestamp, item[channelName]]),
        showSymbol: false,
      },
    ],
  });

  return (
    <div>
      {channelNames.map((channelName, index) => (
        <ReactEcharts
          key={channelName}
          ref={(e) => (echartsRefs.current[index] = e)}
          option={getOption(channelName)}
          style={{ height: "200px", width: "1200px" }}
          opts={{ renderer: "canvas" }}
        />
      ))}
    </div>
  );
};
