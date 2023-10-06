import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { use, useEffect } from "react";

import { authOptions } from "./api/auth/[...nextauth]";

import { Experiment } from "~/components/lab";
import { DashboardLayout } from "~/components/layouts";
import { IExperiment } from "~/@types";

const PlaygroundPage: NextPage = () => {
  const experiments: IExperiment[] = [
    {
      id: 1,
      name: "Eyes Closed/Eyes Open",
      description:
        "The 'Eyes Closed/Eyes Open' task is a common neurofeedback protocol used to measure brain activity during periods of rest and activity. During the task, the participant is instructed to close their eyes for a period of time, followed by opening their eyes for a period of time. This cycle is repeated several times, and the brain activity is measured using EEG sensors. The task is often used to measure changes in brain activity associated with attention, relaxation, and other cognitive processes.",
      url: "/experiments/eyes_closed_eyes_open.html",
      tags: [""],
    },
    {
      id: 2,
      name: "Auditory Oddball - ERP, P300",
      description:
        "We are keen to understand how our brains react when something unexpected happens. They're particularly interested in a brain wave called the 'P300 wave'. This wave is like a signal your brain sends when it recognizes a change in the pattern of sounds. It usually occurs around 300 milliseconds after your brain registers the oddball sound. Start the experiment to see how your brain responsds!",
      url: "/experiments/auditory_oddball.html",
      tags: ["auditory_oddball"],
    },
    {
      id: 3,
      name: "Open Ended Brain Recording",
      description: "Open Ended Brain Recording ",
      url: "",
      tags: ["open_ended"],
    },
    {
      id: 4,
      name: "Neuro Game - Training Intent / (measuring emotional affect 'frustration')",
      description: "The user plays flappy bird while brain activity (eeg) data is recorded - Training Intent",
      url: "/experiments/flappy_bird.html",
    },
    // {
    //   id: 4,
    //   name: "Stroop Task",
    //   description: "Auditory Oddball - ERP, P300",
    //   url: "/experiments/stroop_task.html",
    // },
  ];

  const [activeExperiment, setActiveExperiment] = React.useState(experiments[0]);

  const handleExperimentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenExperiment = experiments.find((experiment) => experiment.name === e.target.value);

    if (chosenExperiment) {
      setActiveExperiment(chosenExperiment);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl">Playground</h1>
      <label htmlFor="countries" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
        Select activity:
        <select
          id="countries"
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
    </DashboardLayout>
  );
};

export default PlaygroundPage;

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
