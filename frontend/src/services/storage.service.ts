import axios from "axios";
import dayjs from "dayjs";
import JSZip from "jszip";
import { DatasetExport } from "~/@types";
import { IDBPDatabase, openDB } from "idb";

export function convertToCSV(arr: any[]) {
  const array = [Object.keys(arr[0] ?? {})].concat(arr);

  return array
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
}

export async function writeDataToStore(dataName: string, data: any, fileTimestamp: string, storeType = "download") {
  // TODO: fix validation
  console.log("fileTimestamp: ", fileTimestamp);

  const providerName = dataName === "event" ? "fusion" : "neurosity";

  if (storeType === "download") {
    const fileName = `${dataName}_${fileTimestamp}.csv`;
    const content = convertToCSV(data); // convert to csv format

    const hiddenElement = document.createElement("a");
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(content)}`;
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  } else if (storeType === "remoteStorage") {
    // call the upload api
    (async () => {
      const res = await axios.post(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/storage/upload`, {
        provider: providerName,
        dataName: dataName, // eslint-disable-line object-shorthand
        fileTimestamp: fileTimestamp, // eslint-disable-line object-shorthand
        content: data,
      });

      if (res.status === 200) {
        // NotificationManager.success(`uploading ${dataName} successful`);
        console.log(`Writing data for ${dataName} complete`);
      } else {
        // NotificationManager.error(`uploading ${dataName} failed`);
        console.log(`Writing data for ${dataName} failed`);
      }
    })();
  }
}

export async function downloadDataAsZip(datasetExport: DatasetExport, zipFileName: string, unixTimestamp: dayjs.Dayjs) {
  const filePath = `${zipFileName}_${unixTimestamp.unix()}.zip`;

  let zip = new JSZip();
  for (let i = 0; i < datasetExport.dataSets.length; i++) {
    const dataSet = datasetExport.dataSets[i];
    const content = convertToCSV(dataSet); // convert to csv format
    zip.file(datasetExport.fileNames[i], content);
  }

  // download the zip file
  const downloadLink = document.createElement("a");
  const blob = await zip.generateAsync({ type: "blob" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filePath}`;
  downloadLink.click();
}

export async function getCSVFile(fileName: string, dataSet: any[]): Promise<File> {
  const content = convertToCSV(dataSet); // convert to csv format
  const blob = new Blob([content], { type: "text/csv" });
  const file = new File([blob], fileName, { type: "text/csv" });
  return file;
}

export async function writeToLocalStorage(datasetExport: DatasetExport, unixTimestamp: dayjs.Dayjs) {
  console.log("writeToLocalStorage", datasetExport);
  const db = await dbPromise;
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");

  for (let i = 0; i < datasetExport.dataSets.length; i++) {
    const fileName = datasetExport.fileNames[i];
    const dataSet = datasetExport.dataSets[i];

    // Create a Blob from the CSV content
    const file = await getCSVFile(fileName, dataSet);

    await store.put({ name: fileName, file });
  }
  await tx.done;

  return true;
}

let dbPromise: Promise<IDBPDatabase<unknown>>;
if (typeof window !== "undefined") {
  dbPromise = openDB("neurofusion-db", 1, {
    upgrade(db) {
      db.createObjectStore("files", { keyPath: "name" });
    },
  });
}

export async function getFiles() {
  const db = await dbPromise;
  return await db.getAll("files");
}

export async function saveFile(name: string, file: File) {
  const db = await dbPromise;
  await db.put("files", { name, file });
}

export async function getFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  return await db.get("files", name);
}

export async function deleteFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  await db.delete("files", name);
}
