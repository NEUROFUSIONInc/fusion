import { Maximize } from "lucide-react";

import { IFusionFeature } from "./types";

export const fusionFeatures: IFusionFeature[] = [
  {
    id: 1,
    title: "individuals",
    description: "Create & respond to personalized prompts to understand changes in your behavior over time",
    featuresList: [
      "Create & respond to personalized prompts ",
      "Take cognitive tests & see how you’re changing",
      "Chat with your data to unlock insights on the go",
      "Participate in quests & contribute to research",
    ],
  },
  {
    id: 2,
    title: "coaches & health professionals",
    description: "Record experiments & design quests (a set of tasks other users can run) and share results",
    featuresList: [
      "Automated scheduling for medication adherence",
      "Symptom monitoring",
      "Trialing interventions",
      "Remote wellbeing monitoring for care specialist",
    ],
  },
  {
    id: 3,
    title: "explorers & researchers",
    description: "See, with consent how clients respond to recommendations & plans outside of consults",
    featuresList: [
      "A playground of exercises for recording brain & behavior data",
      "Design a set of tasks and their execution flow",
      "Run your data with available models & share your results",
      "Define methods that update study results as new data is gotten",
    ],
  },
];
