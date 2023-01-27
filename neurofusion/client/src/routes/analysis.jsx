import React, { useState, useEffect, useRef } from 'react';
import SideNavBar from '../components/sidenavbar';
import * as echarts from 'echarts/lib/echarts';
import { Dropdown, Slider } from '@fluentui/react'

// import magicFlowContexts from "../assets/magicflow_contexts_clean_dec_11.json"
// import neurosityFocus from "../assets/neurosity_focus_clean_dec_11.json"
// import magicFlowRawEvents from "../assets/magicflow_raw_events_clean_dec_11.json"

import powerSpectrumData from "../assets/powerSpectrum_signalQuality_1674454790.json"
import { useNeurofusionUser } from '../services/auth';

export default function Analysis() {
    const neurofusionUserInfo = useNeurofusionUser();

    const [selectedChannels, setSelectedChannels] = useState([]);
    const [selectedFrequencyBands, setSelectedFrequencyBands] = useState([]);
    const [stdDevThreshold, setStdDevThreshold] = useState(15);

    const [brainChart, setBrainChart] = useState(null);
    const brainChartRef = useRef(null);
    const [brainChartOptions, setBrainChartOptions] = useState({});

    const channelNames = ["CP3", "C3", "F5", "PO3", "PO4", "F6", "C4", "CP4"];

    const frequencyBands = [
        { key: 'delta', text: 'Delta' },
        { key: 'theta', text: 'Theta' },
        { key: 'alpha', text: 'Alpha' },
        { key: 'beta', text: 'Beta' },
        { key: 'gamma', text: 'Gamma' }
    ];

    useEffect(() => {
        // only intialize the chart once
        if (brainChartRef.current && brainChart == null) {
            setBrainChart(echarts.init(brainChartRef.current));
        }

        if (brainChart) {
            brainChart.setOption(brainChartOptions, true);
        }
    }, [brainChart, brainChartOptions]);

    useEffect(() => {
        // console.log('selectedChannels', selectedChannels)
        // console.log('selectedFrequencyBands', selectedFrequencyBands)
        if (selectedChannels.length > 0 && selectedFrequencyBands.length > 0) {
            (async () => {
                setBrainChartOptions(await updateBrainChartOptions(
                    selectedChannels[0],
                    selectedFrequencyBands,
                    stdDevThreshold
                ));
            })();
        }
    }, [selectedChannels, selectedFrequencyBands, stdDevThreshold])


    async function updateBrainChartOptions(channelName, frequencyBands, stdDevThreshold = 15) {
        /**
         * @param {string} channelName
         * @returns {object} chartOptions
         * @description
         * This function takes in a channel name and returns the chart options
         * for that channel.
         */

        /**
             // const seriesData = neurosityFocus.map((item) => {
             //     return [item.timestamp, item.probability]
            // })
            * 
            // const verticalLinesData = magicFlowContexts.map((item) => {
            //     return {
            //         name: item.categories[0],
            //         xAxis: item.timestamp,
            //         lineStyle: {
            //             type: 'solid',
            //             color: 'green'
            //         }
            //     }
            // })
    
            // const verticalLinesData2 = magicFlowRawEvents.map((item) => {
            //     return {
            //         name: item.app,
            //         xAxis: item.endDate,
            //         lineStyle: {
            //             type: 'solid',
            //             color: item.focus == true ? 'green' : 'red'
            //         }
            //     }
            // })
            
         */

        const yAxisName = `${channelName} ${frequencyBands} Power (uV^2/Hz)`;
        const xAxisName = "Time"

        const seriesData = [];
        const legendData = [];
        frequencyBands.forEach((frequencyBand) => {
            const powerSpectrumSeries = powerSpectrumData.map((item) => {
                // filter for only good channels
                if (item[`${channelName}_${frequencyBand}`] <= stdDevThreshold) {
                    return [item.unixTimestamp, item[`${channelName}_${frequencyBand}`]]
                }
            })

            const dataLabel = `${channelName} ${frequencyBand} power`;
            legendData.push(dataLabel);
            seriesData.push({
                name: dataLabel,
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                data: powerSpectrumSeries,
                symbol: 'none',
                lineStyle: {
                    width: 2
                }
            });
        });

        const chartTextStyle = {
            color: 'white',
            fontFamily: 'Expletus Sans',
        };

        const options = {
            title: {
                text: `Brain Power Over Time`,
                textStyle: chartTextStyle
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            xAxis: {
                type: 'time',
                name: xAxisName,
                splitLine: {
                    // show: true,
                },
                gap: true,
                breakArea: {
                    areaStyle: {
                        color: 'red'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: yAxisName,
                splitLine: {
                    show: true
                },
                min: 0,
                max: 10
            },
            series: seriesData,
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                data: legendData,
                textStyle: chartTextStyle
            }
        };

        return options;
    }

    return (
        <>
            {
                neurofusionUserInfo.isLoggedIn == true ?
                    <>
                        <SideNavBar></SideNavBar>

                        <main style={{
                            marginLeft: '12%',
                            padding: '0 10px',
                        }}>
                            <p>Correlating your brain activity with health & productivity signals</p>

                            {/* <>Add controls for selecting data type first default to powerSpectrum over time</> */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                            }}>
                                {/* channel pickers */}
                                <Dropdown
                                    label="Channel Picker"
                                    selectedKey={selectedChannels[0]}
                                    onChange={(event, option) => {
                                        setSelectedChannels([option.key]);
                                    }}
                                    placeholder="Select a channel"
                                    options={channelNames.map((channelName) => {
                                        return { key: channelName, text: channelName }
                                    })}
                                    calloutProps={{ doNotLayer: true }}
                                    styles={{
                                        label: {
                                            color: 'white'
                                        }
                                    }}
                                />

                                {/* selecting frequency bands to display */}
                                <Dropdown
                                    placeholder="Select Frequency Bands"
                                    label="Frequency Bands"
                                    selectedKeys={selectedFrequencyBands}
                                    multiSelect
                                    options={frequencyBands}
                                    onChange={(event, option) => {
                                        console.log(option)
                                        setSelectedFrequencyBands(option.selected ? 
                                            [...selectedFrequencyBands, option.key] : 
                                            selectedFrequencyBands.filter((item) => item !== option.key));
                                    }}
                                    calloutProps={{ doNotLayer: true }}
                                    styles={{
                                        label: {
                                            color: 'white'
                                        }
                                    }}
                                />

                                {/* signal quality threshold */}
                                <Slider
                                    label="Signal Quality Threshold (standard deviation)"
                                    max={20}
                                    value={stdDevThreshold}
                                    showValue
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onChange={(value) => {
                                        setStdDevThreshold(value);
                                    }}
                                    styles={{
                                        titleLabel: {
                                            color: 'white'
                                        },
                                        valueLabel: {
                                            color: 'white'
                                        }
                                    }}
                                />
                            </div>

                            {/* TODO: display the label for the recorded time period */}
                            <div ref={brainChartRef} style={{ height: '500px', width: '100%', paddingTop: '20px' }}></div>
                            
                            {/* TODO: add "overlay" for another dataset e.g productivity */}
                            
                        </main>
                    </> : <></>
            }
        </>
    )


}