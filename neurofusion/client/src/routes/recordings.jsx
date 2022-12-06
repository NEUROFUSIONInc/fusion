import React, { useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import SideNavBar from '../components/sidenavbar';


export default function Recordings() {

    return(
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
            }}>
        
                <p>List of recordings will be displayed here</p>
            </main>
        </>
    )


}