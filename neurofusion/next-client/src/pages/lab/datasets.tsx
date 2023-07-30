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
import { timeStamp } from "console";


const dataSetParser = (data:Array<string>) => {
  var recordings = {}

  data.forEach((item: string) => {
    const fname = item.split("/").pop();
    const timestamp = parseInt(fname.substring(fname.lastIndexOf("_") + 1, fname.lastIndexOf(".json")));
    if(!(timestamp in recordings)) recordings[timestamp] = [];
    recordings[timestamp].push(item)
  });

  return recordings

}

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

  const getRange = () => {


  }

  useEffect(() => {
    (async () => {
      const dataSets = dataSetParser(await getDatasets(
      dayjs.unix(1).format("YYYY-MM-DD"),// add 1 day to include today
      dayjs().add(1, "day").format("YYYY-MM-DD")));
      
      const orderedTimes = Object.keys(dataSets).map((str)=>parseInt(str)).sort();
      var orgDataSets = {"All":{}};

      orderedTimes.forEach((time) =>{
        const timeStamp = dayjs.unix(time);
        if(!(timeStamp.format("YYYY") in orgDataSets["All"])) orgDataSets["All"][timeStamp.format("YYYY")] = {}
        if(!(timeStamp.format("MMMM") in orgDataSets["All"][timeStamp.format("YYYY")])) orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")] = {}
        if(!(timeStamp.format("DD") in orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")])) orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")][timeStamp.format("DD")] = {}
        orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")][timeStamp.format("DD")][timeStamp.format("YYYY-MM-DD h:mm A")+" - EEG"] = dataSets[time];

      });
      
        setDatasets(
        orgDataSets["All"]
      );

      // TODO: parse datasets into provider, dataName, time format
    })();
  }, [filterStartDate]);


  const [fCount,setFCount]=useState(0)

return (
  <>
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
  <p>{fCount} Files Selected</p><Button size={"sm"}>Download</Button> <Button size={"sm"}>Clear</Button>
  </div>
  {
    
   <CollapsibleList title="All" defaultOpen={true} listElements={Object.keys(datasets).map((year) => {
      return (<CollapsibleList title={year} listElements={Object.keys(datasets[year]).map((month) => {
        return(<CollapsibleList title={month} listElements={Object.keys(datasets[year][month]).map((day) => {
          return (<CollapsibleList title={day} listElements={Object.keys(datasets[year][month][day]).map((time) => {
            return( <CollapsibleList title={time} listElements={datasets[year][month][day][time].map((rec) => {
              return rec.split("/").pop()    
            })}></CollapsibleList>)
          })}></CollapsibleList>
              
        )})}></CollapsibleList>
              
      )})}></CollapsibleList>
)})}></CollapsibleList>
}
  
</div>
  </>
  );

};

const CollapsibleList = ({listElements,title,defaultOpen=false}) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  console.log(listElements)
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = (event:any) => {
    setChecked(event.target.checked);
  };

  return (
    <div>
      {/* Your list item header */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "- "+title : "+ "+title}
      </button>
      <input style={{marginLeft:".2em", paddingTop:"1em"}} type="checkbox" checked={checked} onChange={handleCheckboxChange} />
      </div>


      {/* Conditionally render the list content based on isExpanded state */}
        <ul style={{ marginLeft: 20, display:isExpanded ? "inherit":"None" }}>
          {listElements.map((item:any) => (
                <li>{item}
                {/* <Button onClick={() => console.log(`Button for ${item} clicked!`)}>Click Me</Button> */}
                </li> 
                
          ))}
          {/* Add more list items as needed */}
        </ul>
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
