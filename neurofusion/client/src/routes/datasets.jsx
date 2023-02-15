import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import SideNavBar from "../components/sidenavbar";
import { useNeurofusionUser } from "../services/auth";

export default function Datasets() {
  const neurofusionUserInfo = useNeurofusionUser();

  return (
    <>
      {neurofusionUserInfo.isLoggedIn == true ? (
        <>
          <SideNavBar></SideNavBar>

          <main
            style={{
              marginLeft: "12%",
            }}
          >
            <p>List of recordings will be displayed here</p>
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
