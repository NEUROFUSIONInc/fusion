import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";

import { DashboardLayout, Meta } from "~/components/layouts";

import { useState, useEffect } from "react";
import { getLocalFiles, getLocalFile, getCSVFile, deleteLocalFile } from "~/services/storage.service";
import { Button } from "~/components/ui";
import dayjs from "dayjs";

const DatasetPage: NextPage = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const fileList = await getLocalFiles();
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

  useEffect(() => {
    const loadFileContent = async () => {
      if (selectedFile) {
        const file = await getLocalFile(selectedFile);
        if (file && file.file) {
          const text = await file.file.text();
          setFileContent(text);
        }
      } else {
        setFileContent(null);
      }
    };

    loadFileContent();
  }, [selectedFile]);

  const handleDownload = async (fileName: string) => {
    const file = await getLocalFile(fileName);
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

  const handleFileClick = async (fileName: string) => {
    setSelectedFile(fileName);
  };

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Datasets | NeuroFusion Explorer",
          description: "Manage your datasets from previous recordings. You can download your data here.",
        }}
      />
      <h1 className="text-4xl font-bold mb-4">Datasets</h1>
      <p className="mb-4">Manage your datasets from previous recordings. You can download your data here..</p>

      {selectedFile && fileContent && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Viewing: {selectedFile}</h2>
            <Button onClick={() => setSelectedFile(null)} className="py-1">
              Close Editor
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
            <iframe
              src={`/code-editor?filename=${encodeURIComponent(selectedFile)}`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={`Editor for ${selectedFile}`}
            />
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {files.map((name, index) => (
          <li key={index} className="flex items-center justify-between">
            <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => handleFileClick(name)}>
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

            <div className="flex items-center space-x-2">
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
              <Button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${name}?`)) {
                    deleteLocalFile(name)
                      .then(() => {
                        setFiles(files.filter((f) => f !== name));
                        if (selectedFile === name) {
                          setSelectedFile(null);
                        }
                      })
                      .catch((error) => {
                        console.error("Error deleting file:", error);
                        alert("Failed to delete file. Please try again.");
                      });
                  }
                }}
                aria-label={`Delete ${name}`}
                className="p-2 hover:bg-gray-100 rounded-full ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
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
