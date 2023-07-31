import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";


import { IntegrationsContainer } from "~/components/features/integrations";
import { DashboardLayout } from "~/components/layouts";

import dayjs from "dayjs";
import axios from "axios";
import { FC, useState, useEffect } from "react";

import { authOptions } from "../api/auth/[...nextauth]";

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import {Button

} from "~/components/ui/button/button"; // Replace this with the actual path to your dropdown menu script
import { timeStamp } from "console";
import { Type } from "lucide-react";
import { object } from "zod";


const dataSetParser = (data:Array<string>) => {
  var recordings:{[key:number]:any} = {}

  data.forEach((item: string) => {
    const fname = item.split("/").pop();
    if(fname !== undefined){
      const timestamp:number = parseInt(fname.substring(fname.lastIndexOf("_") + 1, fname.lastIndexOf(".json")));
      if(!(timestamp in recordings)) recordings[timestamp] = [];
      recordings[timestamp].push(item)
    }
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
  
  async function downloadDatasets(blobNames:Array<string>) {
    let zip = new JSZip();
    for (let i = 0; i < blobNames.length; i++) {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/storage/download`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    blobName: blobNames[i],
                },
                responseType: "blob",
            }
        );

        if (res.status === 200) {
            // add file to zip
            zip.file(blobNames[i], res.data, { binary: true });
        } else {
            console.error(`Unable to fetch dataset: ${blobNames[i]}`);
        }
        setDownloadStatus(Math.round(100*(i/blobNames.length)))
    }

    // generate zip file
    zip.generateAsync({ type: "blob" }).then(function (blob) {
        saveAs(blob, "datasets.zip");
    });
}

  const [filterStartDate, setFilterStartDate] = useState(
    dayjs().subtract(15, "week").format("YYYY-MM-DD")
  );

  const [datasets, setDatasets] = useState({});

  const getRange = () => {


  }


  const [checkedDict, setCheckedDict] = useState({});

  const createCheckedDict = (dict:any,setter:any) => {

    const createMirrorRecurse = (dictLevel:any) => {
      var returnDict:{[key:string]:any} = {checked:false,dict:{}}
      if(isDictionary(dictLevel)){
        Object.keys(dictLevel).forEach((x:string)=>{
          returnDict.dict[x] = createMirrorRecurse(dictLevel[x])
        })
      }else{
        returnDict.dict = [...dictLevel]
      }

      return returnDict;
    }
    var copydict = createMirrorRecurse(dict)
    // console.log(copydict);

    setter(copydict);
  }


  useEffect(() => {
    (async () => {
      const dataSets = dataSetParser(await getDatasets(
      dayjs.unix(1).format("YYYY-MM-DD"),// add 1 day to include today
      dayjs().add(1, "day").format("YYYY-MM-DD")));
      
      const orderedTimes = Object.keys(dataSets).map((str)=>parseInt(str)).sort();
      var orgDataSets: {[key:string]:any} = {"All":{}};

      orderedTimes.forEach((time) =>{
        const timeStamp = dayjs.unix(time);
        if(!(timeStamp.format("YYYY") in orgDataSets["All"]))orgDataSets["All"][timeStamp.format("YYYY")] = {}
        if(!(timeStamp.format("MMMM") in orgDataSets["All"][timeStamp.format("YYYY")])) orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")] = {}
        if(!(timeStamp.format("DD") in orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")])) orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")][timeStamp.format("DD")] = {}
        orgDataSets["All"][timeStamp.format("YYYY")][timeStamp.format("MMMM")][timeStamp.format("DD")][timeStamp.format("YYYY-MM-DD h:mm:ss A")+" - EEG"] = dataSets[time];
      });

      createCheckedDict(orgDataSets["All"],setCheckedDict);

      setDatasets(
        orgDataSets["All"]
      );

      // TODO: parse datasets into provider, dataName, time format
    })();
  }, []);

  const [fSelected,setFSelected]= useState(Array<string>)

  function isDictionary(variable:any) {
    return typeof variable === 'object' && !Array.isArray(variable) && variable !== null;
  }

  const recurseSet = (level:any,checked:boolean,checkCopy:object) => {
    var head:any = checkCopy;
    
    level.forEach((ele:any)=>{
      head = head.dict[ele];
    });

    head.checked = (checked)

    if(isDictionary(head.dict)){
      Object.keys(head.dict).forEach((x:any)=>{
        const arr = [...level];
        arr.push(x);
        recurseSet(arr,checked,checkCopy)})
    }else{

    }
    return checkCopy
  }

  const genHandler = (level:Array<string>) => {
    const handleCheckboxChange = (event:any) => {
      var subDirs: {[key:string]:any} = datasets
      level.forEach((ele)=>{
        subDirs = subDirs[ele]; 
      }); 
      setCheckedDict(recurseSet(level,event.target.checked,structuredClone(checkedDict)));
    }
    
    var head : {[key:string]:any} = checkedDict
    level.forEach((ele:any)=>{
      head = head.dict[ele];
    });

    return {"handler":handleCheckboxChange,"checked":head.checked};
  };

  useEffect(() => {
    const recurseAdd = (head:any) => {

      var arr:Array<string> = [];

      if(isDictionary(head.dict)){
        Object.keys(head.dict).forEach((x:any)=>{
          arr = arr.concat(recurseAdd(head.dict[x]))})
      }else{
        if(head.checked){
          arr = arr.concat(head.dict)
        }
      }
        return arr;
    }
    setFSelected(recurseAdd(checkedDict));
  }, [checkedDict]);

  const clearSelection = () =>{
    setCheckedDict(recurseSet([],false,structuredClone(checkedDict)));
  };

  const [downloadStatus,setDownloadStatus] = useState(100)

  async function downloadSelection(){
    setDownloadStatus(0);
    console.log(`Downloading`,fSelected)

    await downloadDatasets(structuredClone(fSelected))
    setDownloadStatus(100);
  };

  const CircularProgress = (percentage:number) => { 
    const [displayedPercentage, setDisplayedPercentage] = useState(percentage);
    const strokeDashoffset = ((100 - displayedPercentage) / 100) * 2 * Math.PI * 45;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDisplayedPercentage(prev => prev + (percentage - prev) / 10);
        }, 20);
        return () => clearInterval(intervalId);
    }, [percentage]);

    return (
        <svg width="50" height="50" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" stroke="gray" strokeWidth="15" fill="none" />
            <circle cx="60" cy="60" r="45" stroke="blue" strokeWidth="15" fill="none" strokeDasharray="282.7" strokeDashoffset={strokeDashoffset} className="progress" />
            <text x="60" y="70" textAnchor="middle" fill="white" fontSize="30px">{`${Math.floor(displayedPercentage)}%`}</text>
            <style jsx>{`
                .progress {
                    transition: stroke-dashoffset 0.02s linear;
                }
            `}</style>
        </svg>
    );
}

return (
  <>
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
    
    {downloadStatus != 100 ? <><p>Downloading files please remain on page</p> <CircularProgress percentage = {downloadStatus}> </CircularProgress></>:
      <>
      <p>{fSelected.length} Files selected</p><Button onClick={downloadSelection} size={"sm"}>Download</Button> <Button onClick={clearSelection} size={"sm"}>Clear</Button >
      </>
    }
  </div>
  {

  
   <CollapsibleList title="All" checkhandler = {genHandler([])} defaultOpen={true} listElements={Object.keys(datasets).map((year) => {
      return (<CollapsibleList title={year} checkhandler = {genHandler([year])} listElements={Object.keys(datasets[year]).map((month) => {
        return(<CollapsibleList title={month} checkhandler = {genHandler([year,month])} listElements={Object.keys(datasets[year][month]).map((day) => {
          return (<CollapsibleList title={day} checkhandler = {genHandler([year,month,day])} listElements={Object.keys(datasets[year][month][day]).map((time) => {
            return( <CollapsibleList title={time} checkhandler = {genHandler([year,month,day,time])} listElements={datasets[year][month][day][time].map((rec) => {
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
interface CollapsibleListProps {
  listElements: Array<any>;
  title: string;
  checkhandler: any;
  defaultOpen?: boolean; // The ? indicates that this prop is optional
}

const CollapsibleList: React.FC<CollapsibleListProps> = ({
  listElements,
  title,
  checkhandler,
  defaultOpen = false // Default values are set here
}) =>{
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [checked, setChecked] = useState(false)

  useEffect(()=>{setChecked(checkhandler.checked);},[checkhandler.checked])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "- "+title : "+ "+title}
      </button>
      <input style={{marginLeft:".2em"}} type="checkbox" checked={checked} onChange={checkhandler.handler} />
      </div>
        <ul style={{ marginLeft: 20, display:isExpanded ? "inherit":"None" }}>
          {listElements.map((item:any) => (
                <li>{item}
                </li> 
          ))}
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
