import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import SideNavBar from "../components/sidenavbar";
import { useNeurofusionUser } from "../services/auth";

import dayjs from "dayjs";
import axios from "axios";
import { Icon } from "@fluentui/react/lib/Icon";
import { IconButton } from "@fluentui/react/lib/Button";

export default function Datasets() {
  const neurofusionUserInfo = useNeurofusionUser();

  const [filterStartDate, setFilterStartDate] = useState(
    dayjs().subtract(1, "week").format("YYYY-MM-DD")
  );

  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    (async () => {
      setDatasets(
        await getDatasets(
          filterStartDate,
          dayjs().add(1, "day").format("YYYY-MM-DD") // add 1 day to include today
        )
      );

      // TODO: parse datasets into provider, dataName, time format
    })();
  }, [filterStartDate]);

  async function getDatasets(startDate, endDate) {

    const res = await axios.get( 
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/search`,
        {
        params: {
          startTimestamp: dayjs(startDate).unix(),
          endTimestamp: dayjs(endDate).unix(),
        },
      }
    );

    if (res.status == 200) {
      console.log("avaliable datasets");
      console.log(res.data);
      return res.data.blobNames;
    } else {
      console.error(`unable to fetch datasets`);
      return [];
    }
  }

  async function downloadDataset(blobName) {
    const res = await axios.get(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/download`,
      {
        params: {
          blobName: blobName,
        },
        responseType: "blob",
      }
    );

    if (res.status == 200) {
      // create file link in browser's memory
      const href = URL.createObjectURL(res.data);

      // create "a" HTML element with href to file & click
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", blobName); //or any other extension
      document.body.appendChild(link);
      link.click();

      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } else {
      console.error(`unable to fetch datasets`);
    }
  }

  return (
    <>
      {neurofusionUserInfo.isLoggedIn == true ? (
        <>
          <SideNavBar></SideNavBar>

          <main
            style={{
              marginLeft: "12%",
              paddingLeft: "10px",
            }}
          >
            <h1>Datasets</h1>

            <p>
              Displaying recorded datasets since:{" "}
              {dayjs(filterStartDate).toString()}
            </p>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
            {/* make request to show data collected in the last week / month */}

            {datasets.map((dataset) => {
              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <p>{dataset}</p>
                    <IconButton
                      iconProps={{ iconName: "Download" }}
                      title="Download"
                      ariaLabel="Download"
                      onClick={() => {
                        downloadDataset(dataset);
                      }}
                    />
                  </div>
                </>
              );
            })}
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
