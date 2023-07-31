import axios from "axios";
import dayjs from "dayjs";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getSession } from 'next-auth/react'

export const getDatasets = async (startDate:any, endDate:any) => {
    const session  = await getSession()
    if(!session?.user) return []
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/storage/search`,
      {
        headers: {
          Authorization: `Bearer ${session.user.authToken}`,
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
  
  export async function downloadDatasets(blobNames:Array<string>,downloadStatusSet:Function) {
    const session  = await getSession();
    if(!session?.user) return false
    let zip = new JSZip();
    for (let i = 0; i < blobNames.length; i++) {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/storage/download`,
            {
                headers: {
                    Authorization: `Bearer ${session.user.authToken}`,
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
        downloadStatusSet(Math.round(100*(i/blobNames.length)))
    }

    // generate zip file
    zip.generateAsync({ type: "blob" }).then(function (blob) {
        saveAs(blob, "datasets.zip");
    });
    return true;
}