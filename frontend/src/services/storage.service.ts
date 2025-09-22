import axios from "axios";
import dayjs from "dayjs";
import JSZip from "jszip";
import { DatasetExport } from "~/@types";
import { IDBPDatabase, openDB } from "idb";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { MemoryBlockstore } from "blockstore-core";

import { OrbisDB, type OrbisConnectResult } from "@useorbis/db-sdk";
import { OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";

export function convertToCSV(arr: any[]) {
  const array = [Object.keys(arr[0] ?? {})].concat(arr);

  return array
    .map((it) => {
      return Object.values(it)
        .map((value) => {
          if (typeof value === "string" && value.includes(",")) {
            // Escape commas and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",");
    })
    .join("\n");
}

export async function writeDataToStore(dataName: string, data: any, fileTimestamp: string, storeType = "download") {
  // TODO: fix validation
  console.log("writing data to store:");
  console.log("fileTimestamp ", fileTimestamp);
  console.log("dataName ", dataName);

  const providerName = dataName === "event" ? "fusion" : "neurosity";
  const fileName = `${dataName}_${fileTimestamp}.csv`;

  if (storeType === "download") {
    const content = convertToCSV(data); // convert to csv format

    const hiddenElement = document.createElement("a");
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
    hiddenElement.target = "_blank";
    hiddenElement.download = fileName;
    hiddenElement.click();
  } else if (storeType === "remoteStorage") {
    // call the upload api
    (async () => {
      const res = await axios.post(`${process.env["NEXT_PUBLIC_NEUROFUSION_BACKEND_URL"]}/api/storage/upload`, {
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
  } else if (storeType === "localStorage") {
    const content = convertToCSV(data); // convert to csv format
    const blob = new Blob([`data:text/csv;charset=utf-8,${encodeURIComponent(content)}`], { type: "text/csv" });
    const file = new File([blob], fileName, { type: "text/csv" });

    // save to local storage
    await saveLocalFile(fileName, file);
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

/**
 * Methods for storing locally on IndexDB
 */
let dbPromise: Promise<IDBPDatabase<unknown>>;
if (typeof window !== "undefined") {
  dbPromise = openDB("neurofusion-db", 1, {
    upgrade(db) {
      db.createObjectStore("files", { keyPath: "name" });
    },
  });
}

export async function getLocalFiles() {
  const db = await dbPromise;
  return await db.getAll("files");
}

export async function saveLocalFile(name: string, file: File) {
  const db = await dbPromise;
  await db.put("files", { name, file });
}

export async function getLocalFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  return await db.get("files", name);
}

export async function deleteLocalFile(name: IDBValidKey | IDBKeyRange) {
  const db = await dbPromise;
  await db.delete("files", name);
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

/**
 * Decentralized storage methods
 */
export async function uploadToIpfs(file: File) {
  try {
    const blockstore = new MemoryBlockstore();
    const helia = await createHelia({ blockstore });
    const fs = unixfs(helia);
    const fileBuffer = await file.arrayBuffer();
    const cid = await fs.addFile({
      content: new Uint8Array(fileBuffer),
      path: `./${file.name}`,
    });
    await helia.stop();
    return cid;
  } catch (error) {
    console.error("Error uploading to IPFS", error);
  }
}

interface CausalityNetworkSchema {
  CID: string;
  name: string;
  owner: string;
  contentHash: string;
  startTimestamp: string;
  endTimestamp: string;
  additionalMeta: string;
}

export async function uploadToCeramic(entry: CausalityNetworkSchema) {
  try {
    const randomSeed = await OrbisKeyDidAuth.generateSeed("hex");
    const orbis = new OrbisDB({
      ceramic: {
        gateway: "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/",
      },
      nodes: [
        {
          gateway: "https://studio.useorbis.com",
          env: process.env["NEXT_PUBLIC_CERAMIC_ENV_ID"],
        },
      ],
    });
    const auth = await OrbisKeyDidAuth.fromSeed(randomSeed);
    const authResult: OrbisConnectResult = await orbis.connectUser({ auth });
    console.log("authResult", authResult);

    // SAVE TO ORBIS
    const updatequery = await orbis
      .insert(process.env["NEXT_PUBLIC_CERAMIC_ATTESTATION_TABLE_ID"] as string)
      .value(entry)
      .context(process.env["NEXT_PUBLIC_CERAMIC_CONTEXT_ID"] as string)
      .run();

    if (updatequery.content) {
      console.log("updatequery.content", updatequery.content);
      return true;
    }

    console.log("updatequery FAILED");
    return false;
  } catch (error) {
    console.log("error", error);
    return false;
  }
}
