import React, { useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import SideNavBar from '../components/sidenavbar';

import magicFlowContexts from "../assets/magicflow_contexts_clean.json"
import neurosityFocus from "../assets/neurosity_focus_clean.json"

export default function Analysis() {

    const seriesData = neurosityFocus.map((item) => {
        return [item.timestamp, item.probability]
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
            name: 'focus probability',
            splitLine: {
                show: true
            },
            min: 0,
            max: 1
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: seriesData,
                markLine: {
                    label: {
                        show: true,
                        formatter: '{b}'
                    },
                    symbol: 'none',
                    data: verticalLinesData
                }
            }
        ]
    };

    // for now just feed in the base data
    return (
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
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