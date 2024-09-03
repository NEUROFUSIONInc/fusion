import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useEffect } from "react";

import { authOptions } from "./api/auth/[...nextauth]";

import { Experiment } from "~/components/lab";
import { DashboardLayout, Meta } from "~/components/layouts";
import { experiments } from "~/config/data";
import { OnboardingModal } from "~/components/modals";
import { useRouter } from "next/router";

const RecordingsPage: NextPage = () => {
  const [activeExperiment, setActiveExperiment] = React.useState(experiments[0]);

  const router = useRouter();
  const { activityId } = router.query;

  useEffect(() => {
    if (activityId && typeof activityId === "string") {
      const chosenExperiment = experiments.find((experiment) => experiment.id === parseInt(activityId, 10));
      if (chosenExperiment) {
        setActiveExperiment(chosenExperiment);
      }
    }
  }, [activityId]);

  const handleExperimentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenExperiment = experiments.find((experiment) => experiment.name === e.target.value);

    if (chosenExperiment) {
      router.push(`/recordings?activityId=${chosenExperiment.id}`, undefined, { shallow: true });
      setActiveExperiment(chosenExperiment);
    }
  };

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Brain Recordings | NeuroFusion",
          description:
            "The simplest way to record and analyze your brain activity. Choose from a variety of cognitive experiments to record your brain activity and see results.",
          image: "https://usefusion.app/images/features/neurofusion_experiment.png",
        }}
      />
      <h1 className="text-4xl">Brain Recordings</h1>
      <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
        Choose activity:
        <select
          id="activity"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          onChange={handleExperimentSelect}
          value={activeExperiment.name}
        >
          {experiments.map((experiment) => {
            return (
              <option key={experiment.id} value={experiment.name}>
                {experiment.name}
              </option>
            );
          })}
        </select>
      </label>
      <Experiment {...activeExperiment} />
      <OnboardingModal />
    </DashboardLayout>
  );
};

export default RecordingsPage;

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
