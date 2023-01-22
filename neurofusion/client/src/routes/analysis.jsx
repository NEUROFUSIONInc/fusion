import React, { useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import SideNavBar from '../components/sidenavbar';

import magicFlowContexts from "../assets/magicflow_contexts_clean_dec_11.json"
import neurosityFocus from "../assets/neurosity_focus_clean_dec_11.json"
import magicFlowRawEvents from "../assets/magicflow_raw_events_clean_dec_11.json"
import powerSpectrumData from "../assets/neurosity_power_spectrum_clean_dec_11.json"


export default function Analysis() {

    const seriesData = neurosityFocus.map((item) => {
        return [item.timestamp, item.probability]
    })

    const powerSpectrumSeries = powerSpectrumData.map((item) => {
        return [item.unixTimestamp, item.CP3_alpha]
    })
    
    const verticalLinesData = magicFlowContexts.map((item) => {
        return {
            name: item.categories[0],
            xAxis: item.timestamp,
            lineStyle: {
                type: 'solid',
                color: 'green'
            }
        }
    })

    const verticalLinesData2 = magicFlowRawEvents.map((item) => {
        return {
            name: item.app,
            xAxis: item.endDate,
            lineStyle: {
                type: 'solid',
                color: item.focus == true ? 'green' : 'red'
            }
        }
    })


    const options = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                // show: true,
            }
        },
        yAxis: {
            type: 'value',
            // name: 'focus probability',
            splitLine: {
                show: true
            },
            // min: 0,
            // max: 1
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: powerSpectrumSeries, //seriesData,
                markLine: {
                    label: {
                        show: true,
                        formatter: '{b}'
                    },
                    symbol: 'none',
                    data: verticalLinesData2
                }
            }
        ]
    };

    // for now just feed in the base data
    return (
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '12%',
            }}>
                <p>Correlating your brain activity with health & productivity signals</p>

                <ReactEcharts
                    option={options}
                    style={{ height: '500px', width: '100%' }}
                />
            </main>

        </>
    )


}