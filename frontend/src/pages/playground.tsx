import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useEffect } from "react";

import { authOptions } from "./api/auth/[...nextauth]";

import { Experiment } from "~/components/lab";
import { DashboardLayout, Meta } from "~/components/layouts";
import { IExperiment } from "~/@types";

import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui";

const PlaygroundPage: NextPage = () => {
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [showDataHandlingModal, setShowDataHandlingModal] = useState(false);

  useEffect(() => {
    const viewedOnboarding = localStorage.getItem("viewedOnboarding");
    if (viewedOnboarding !== "true") {
      setShowCapabilitiesModal(true);
    }
  }, []);

  const handleCapabilitiesNext = () => {
    setShowCapabilitiesModal(false);
    setShowDataHandlingModal(true);
  };

  const handleDataHandlingPrevious = () => {
    setShowCapabilitiesModal(true);
    setShowDataHandlingModal(false);
  };

  const handleDataHandlingGetStarted = () => {
    setShowDataHandlingModal(false);
    localStorage.setItem("viewedOnboarding", "true");
  };

  const handleCloseCapabilities = () => {
    setShowCapabilitiesModal(false);
  };

  const handleCloseDataHandling = () => {
    setShowDataHandlingModal(false);
  };
  // const handleRemoveOnboarding = () => {
  //   localStorage.removeItem("viewedOnboarding");
  //   setShowCapabilitiesModal(true);
  // };
  const experiments: IExperiment[] = [
    {
      id: 3,
      name: "Open Ended Brain Recording",
      description:
        "Record your brain activity while performing a task of your choice. Afterwards, you can observe changes in your brain power over time and compare it to other activities.",
      url: "",
      tags: ["open_ended"],
    },
    {
      id: 1,
      name: "Resting State - Eyes Closed/Eyes Open",
      description:
        "The 'Eyes Closed/Eyes Open' task is a common neurofeedback protocol used to measure brain activity during periods of rest and activity. During the task, the participant is instructed to close their eyes for a period of time, followed by opening their eyes for a period of time. This cycle is repeated several times, and the brain activity is measured using EEG sensors. The task is often used to measure changes in brain activity associated with attention, relaxation, and other cognitive processes.",
      url: "/experiments/eyes_open_eyes_closed.html",
      tags: ["resting_state"],
    },
    {
      id: 2,
      name: "Auditory Oddball - P300, Event Related Potential",
      description:
        "We want to understand how our brains react when something unexpected happens. They're particularly interested in a brain wave called the 'P300 wave'. This wave is like a signal your brain sends when it recognizes a change in the pattern of sounds. It usually occurs around 300 milliseconds after your brain registers the oddball sound. Start the experiment to see how your brain responds!",
      url: "/experiments/auditory_oddball.html",
      tags: ["auditory_oddball"],
    },
    {
      id: 4,
      name: "Neuro Game - Training Intent / Measuring emotional valence",
      description:
        "The user plays flappy bird while brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to - Training Intent (Spacebar press) and Measuring emotional valence",
      url: "/experiments/flappy_bird.html",
    },
    {
      id: 5,
      name: "Stroop Task - Cognitive Test",
      description:
        "The Stroop task is a classic test of cognitive control and attentional flexibility. It is often used in clinical and experimental settings to measure selective attention and cognitive control. The task involves naming the color of a word, while ignoring the semantic meaning of the word. For example, the word 'red' might be written in blue ink. The task is often used to measure changes in brain activity associated with attention, relaxation, and other cognitive processes.",
      url: "/experiments/stroop_task.html",
    },
    // {
    //   id: 6,
    //   name: "Neuro Art - Generating Images from EEG",
    //   description:
    //     "Generate images from your brain waves. View some images and then see if you can think of the same image. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with images.",
    //   url: "/experiments/eeg_image.html",
    // },
    // {
    //   id: 7,
    //   name: "N-Back Task - Memory Test",
    //   description:
    //     "See if you remember the sequence or word patterns. You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
    //   url: "/experiments/memory_test.html",
    // },
    // {
    //   id: 6,
    //   name: "Neuro Game - Thought to text",
    //   description:
    //     "You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
    //   url: "/experiments/thought_to_text.html",
    // },
    // {
    //   id: 7,
    //   name: "N-Back Task - Cognitive Test",
    //   description:
    //     "See if you remember the sequence or word patterns. You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
    //   url: "/experiments/thought_to_text.html",
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
      <Meta
        meta={{
          title: "Playground | Fusion Explorer",
          description:
            "The simplest way to record and analyze your brain activity. Choose from a variety of experiments to record your brain activity and see results.",
          image: "https://usefusion.app/images/features/neurofusion_experiment.png",
        }}
      />
      <h1 className="text-4xl">Playground</h1>
      <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
        Select activity:
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
      <div>
        {showCapabilitiesModal && (
          <CapabilitiesModal onNext={handleCapabilitiesNext} onCancel={handleCloseCapabilities} />
        )}
        {showDataHandlingModal && (
          <DataHandlingModal
            onPrevious={handleDataHandlingPrevious}
            onGetStarted={handleDataHandlingGetStarted}
            onClose={handleCloseDataHandling}
          />
        )}
      </div>
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

interface CapabilitiesModalProps {
  onNext: () => void;
  onCancel: () => void;
}

const CapabilitiesModal: React.FC<CapabilitiesModalProps> = ({ onNext, onCancel }) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>Welcome to Fusion</DialogTitle>
        <DialogDescription>
          Here's what you can do with Fusion:
          <div className="list-disc ml-6 mt-2">
            <p>Record brain activity during cognitive experiments</p>
            <p>Respond to prompts on mobile devices</p>
          </div>
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button intent="primary" onClick={onNext}>
            Next
          </Button>
          <Button intent="dark" onClick={onCancel} className="ml-2">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface DataHandlingModalProps {
  onPrevious: () => void;
  onGetStarted: () => void;
  onClose: () => void;
}

const DataHandlingModal: React.FC<DataHandlingModalProps> = ({ onPrevious, onGetStarted, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Data Handling in Fusion</DialogTitle>
        <DialogDescription>
          How Fusion handles your data:
          <ul className="list-disc ml-6 mt-2">
            <li>Assigns anonymous identities with no email required</li>
            <li>Stores data locally on your device</li>
          </ul>
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button onClick={onPrevious}>Previous</Button>
          <Button intent="dark" onClick={onGetStarted} className="ml-2">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CapabilitiesModal, DataHandlingModal };
