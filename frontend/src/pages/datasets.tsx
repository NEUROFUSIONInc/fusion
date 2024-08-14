import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";

import { DashboardLayout } from "~/components/layouts";

import { useState, useEffect } from "react";
import { getFiles, getFile, getCSVFile } from "~/services/storage.service";
import { Button } from "~/components/ui";
import dayjs from "dayjs";

const DatasetPage: NextPage = () => {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const fileList = await getFiles();
      setFiles(
        fileList
          .map((file) => file.name)
          .sort((a, b) => {
            const timestampA = a.split("_").pop() || "";
            const timestampB = b.split("_").pop() || "";
            return parseInt(timestampB) - parseInt(timestampA);
          })
      );
    };

    fetchFiles();
  }, []);

  const handleDownload = async (fileName: string) => {
    const file = await getFile(fileName);
    if (file && file.file) {
      let csvFile;
      if (fileName.endsWith(".csv")) {
        csvFile = file.file;
      } else if (fileName.endsWith(".json")) {
        const jsonData = JSON.parse(await file.file.text());
        csvFile = await getCSVFile(fileName, jsonData);
      } else {
        console.error("Unsupported file type");
        return;
      }

      const url = URL.createObjectURL(csvFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Datasets</h1>
      <ul className="space-y-2">
        {files.map((name, index) => (
          <li key={index} className="flex items-center justify-between">
            <span>
              {(() => {
                const parts = name.split("_");
                const timestamp = parts.pop() || "0";
                const fileName = parts.join("_");
                const timestampNumber = parseInt(timestamp);
                const date =
                  timestampNumber > 9999999999
                    ? dayjs(timestampNumber) // milliseconds
                    : dayjs.unix(timestampNumber); // seconds
                const formattedDate = date.format("dd, DD MMM YYYY - hh:mm a");
                return `${fileName} - Recorded on ${formattedDate}`;
              })()}
            </span>
            <Button
              onClick={() => handleDownload(name)}
              aria-label={`Download ${name}`}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </li>
        ))}
      </ul>
    </DashboardLayout>
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
