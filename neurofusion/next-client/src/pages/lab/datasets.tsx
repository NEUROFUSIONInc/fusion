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
import { Type } from "lucide-react";


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
      `${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/storage/download`,
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


  const [checkedDict, setCheckedDict] = useState({});

  const createCheckedDict = (dict:any,setter:any) => {

    const createMirrorRecurse = (dictLevel) => {
      var returnDict = {checked:false,dict:{}}
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
      var orgDataSets = {"All":{}};

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

  const [fSelected,setFSelected]=useState([])

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
    var subDirs = datasets
    level.forEach((ele)=>{
      subDirs = subDirs[ele]; 
    }); 
    setCheckedDict(recurseSet(level,event.target.checked,structuredClone(checkedDict)));
  }
    
    var head = checkedDict
    level.forEach((ele:any)=>{
      head = head.dict[ele];
    });

    return {"handler":handleCheckboxChange,"checked":head.checked};
  };

  useEffect(() => {
    console.log(checkedDict); // This will show the updated value of `count` after every state update.
    const recurseAdd = (head:any) => {

      var arr:Array<String> = [];

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

  const downloadSelection = () => {
    console.log(`Downloading`,fSelected)
    fSelected.forEach(file => {
      console.log(`Downloading ${file}`)
      downloadDataset(file);
    });

  };

return (
  <>
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
  <p>{fSelected.length} Files Selected</p><Button onClick={downloadSelection} size={"sm"}>Download</Button> <Button onClick={clearSelection} size={"sm"}>Clear</Button >
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

const CollapsibleList = ({listElements,title,checkhandler,defaultOpen=false}) => {
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
