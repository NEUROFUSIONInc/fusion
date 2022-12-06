import React, { useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import SideNavBar from '../components/sidenavbar';


export default function Analysis() {

    // for now just feed in the base data
    return(
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
            }}>
                <p>Correlating your brain activity with health & productivity signals</p>
            </main>

        </>
    )


}