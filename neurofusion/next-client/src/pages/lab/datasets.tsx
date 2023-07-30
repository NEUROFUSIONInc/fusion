import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";


import { IntegrationsContainer } from "~/components/features/integrations";
import { DashboardLayout } from "~/components/layouts";

import dayjs from "dayjs";
import axios from "axios";
import { FC, useState, useEffect } from "react";

import { authOptions } from "../api/auth/[...nextauth]";



import {Button

} from "~/components/ui/button/button"; // Replace this with the actual path to your dropdown menu script


const DatasetPage: NextPage = () => {
  return (
    <DashboardLayout>
      <DataDisplay />
    </DashboardLayout>
  );
};
export const DataDisplay: FC = () => {
  async function getDatasets(startDate:any, endDate:any) {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/storage/search`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
  
  async function downloadDataset(blobName:any) {
    const res = await axios.get(
      `${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

  const [filterStartDate, setFilterStartDate] = useState(
    dayjs().subtract(15, "week").format("YYYY-MM-DD")
  );

  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    (async () => {
      var dataSets = {};
      for (let i = 0; i < 20; i++) {
          console.log(i)
          dataSets[i] = await getDatasets(
          dayjs().subtract(i, "day").format("YYYY-MM-DD"),
          dayjs().subtract(i-1, "day").format("YYYY-MM-DD") // add 1 day to include today
        )

      }
      console.log(dataSets)
      setDatasets(
        dataSets
      );

      // TODO: parse datasets into provider, dataName, time format
    })();
  }, [filterStartDate]);



return (
  <>
  <p>Hello</p>
  <CollapsibleList listElements={[<CollapsibleList listElements={["3","4"]}></CollapsibleList>,"2"]}></CollapsibleList>
  </>
  );

};

const CollapsibleList = ({listElements}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      {/* Your list item header */}
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>

      {/* Conditionally render the list content based on isExpanded state */}
      {isExpanded && (
        <ul>
          {listElements.map((item:any) => (
                <li>{item} 
                {/* <Button onClick={() => console.log(`Button for ${item} clicked!`)}>Click Me</Button> */}
                </li> 
                
          ))}
          {/* Add more list items as needed */}
        </ul>
      )}
    </div>
  );
};


export default DatasetPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
