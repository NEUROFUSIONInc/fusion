import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useEffect, useState } from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Input } from "~/components/ui";
import { set } from "zod";

interface ResponseImage {
  key: string;
  value: string;
  summary: string;
}

const AnalysisPage: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const [images, setImages] = useState<ResponseImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ResponseImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [eegFile, setEegFile] = useState<File | null>(null);
  const [stimulusFile, setStimulusFile] = useState<File | null>(null);

  const [samplingFrequency, setSamplingFrequency] = useState<number | null>(256);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  const handleUpload = async () => {
    if (eegFile) {
      const formData = new FormData();
      if (eegFile) {
        formData.append("eegFile", eegFile);
      }
      if (stimulusFile) {
        formData.append("stimulusFile", stimulusFile);
      }

      // we need to extract from the file url the exact timestamp
      const fileMatch = (eegFile as File).name.match(/(\d+)/);
      if (!fileMatch || !(fileMatch?.length > 0)) {
        alert(
          "EEG file name does not contain a timestamp. Make sure you're uploading a dataset recorded on the playground."
        );
        return;
      }

      const fileTimestamp = fileMatch[0];
      formData.append("fileTimestamp", fileTimestamp);

      // add the sampling frequency to the form data
      if (samplingFrequency) {
        console.log("samplingFrequency", samplingFrequency);
        formData.append("samplingFrequency", samplingFrequency.toString());
      }

      try {
        setLoading(true);
        const urlEndpoint = stimulusFile ? "process_visual_oddball" : "process_eeg_fooof";
        const response = await fetch(`${process.env["NEXT_PUBLIC_ANALYSIS_SERVER_URL"]}/api/v1/${urlEndpoint}`, {
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
      <Meta
        meta={{
          title: "Analysis | NeuroFusion",
        }}
      />
      <h1 className="text-4xl">Analysis</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">
        Upload a .csv file of EEG data and get a report on brain activity in that time period.
      </p>

      <div>
        <div className="my-3 flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <label
              htmlFor="eegFileInput"
              className="flex items-center cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload EEG File
              <input
                type="file"
                id="eegFileInput"
                name="eegFile"
                onChange={(e) => {
                  setEegFile(e.target.files?.[0] || null);
                }}
                className="hidden"
              />
            </label>
            {eegFile && (
              <span className="text-sm text-gray-600 dark:text-gray-400">Selected EEG file: {eegFile.name}</span>
            )}
          </div>

          {eegFile && (
            <div className="flex items-center space-x-4">
              <label htmlFor="samplingFrequency" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Sampling Frequency:
              </label>
              <select
                id="samplingFrequency"
                name="samplingFrequency"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                onChange={(e) => {
                  // You can add state management for the sampling frequency here if needed
                  setSamplingFrequency(parseInt(e.target.value));
                }}
              >
                <option value="256">Muse - 256Hz</option>
                <option value="250">Neurosity - 250Hz</option>
              </select>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label
              htmlFor="stimulusFileInput"
              className="flex items-center cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Stimulus File
              <input
                type="file"
                id="stimulusFileInput"
                name="stimulusFile"
                onChange={(e) => setStimulusFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {stimulusFile && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Selected stimulus file: {stimulusFile.name}
              </span>
            )}
          </div>
        </div>

        <Button intent={"dark"} type="button" onClick={handleUpload} disabled={!eegFile}>
          Run Analysis
        </Button>
      </div>

      {loading && <p>Processing...</p>}

      {images.length > 0 && (
        <div className="my-4">
          <select
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            onChange={(e) => {
              const selectedImage = images.find((img) => img.key === e.target.value);
              if (selectedImage) {
                setSelectedImage(selectedImage);
              }
            }}
          >
            {images.map((image) => (
              <option key={image.key} value={image.key}>
                {image.key}
              </option>
            ))}
          </select>
          {selectedImage && (
            <div className="my-4">
              <h2 className="text-xl font-bold mb-2">{selectedImage.key}</h2>
              <p dangerouslySetInnerHTML={{ __html: selectedImage.summary?.replace(/\n/g, "<br>") }}></p>
              <img src={selectedImage.value} alt={selectedImage.key} />
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AnalysisPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    // login the user
    const currentUrl = `${req.url}`;
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
