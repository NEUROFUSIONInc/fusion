import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState } from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Input } from "~/components/ui";
import { set } from "zod";

interface ResponseImage {
  key: string;
  value: string;
}

const AnalysisPage: NextPage = () => {
  const [file, setFile] = useState(null);

  const [images, setImages] = useState<ResponseImage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: { target: { files: React.SetStateAction<null>[] } }) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    // TODO: support multiple file uploads for comparison
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      // we need to extract from the file url the exact timestamp
      const fileMatch = (file as File).name.match(/(\d+)/);
      if (!fileMatch || !(fileMatch?.length > 0)) {
        alert(
          "File name does not contain a timestamp. Make sure you're uploading a dataset recorded on the playground."
        );
        return;
      }

      const fileTimestamp = fileMatch[0];
      formData.append("fileTimestamp", fileTimestamp);
      console.log(file);

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_ANALYSIS_SERVER_URL}/api/v1/process_eeg`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("File uploaded successfully:", responseData);
          if (responseData.images) {
            setLoading(false);
            setImages(responseData.images);
          }
        } else {
          setLoading(false);
          console.error("Failed to upload file");
        }
      } catch (error) {
        setLoading(false);
        console.error("Error:", error);
      }
    } else {
      console.error("No file selected.");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl">Analysis</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">
        Upload a zip file from a previous recording completed on the playground
      </p>

      <div>
        <div className="my-3">
          <label htmlFor="fileInput">Upload File</label>:{" "}
          <input type="file" id="fileInput" name="zipFile" onChange={handleFileChange} />
        </div>
        <Button intent={"dark"} type="button" onClick={handleUpload} disabled={file ? false : true}>
          Run Analysis
        </Button>
      </div>

      {loading && <p>Processing...</p>}

      {images.length > 0 &&
        images.map((image) => (
          <div>
            <p>{image.key}</p>
            <img src={image.value} alt={image.key} />
          </div>
        ))}
    </DashboardLayout>
  );
};

export default AnalysisPage;

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
