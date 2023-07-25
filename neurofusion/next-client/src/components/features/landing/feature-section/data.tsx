import { Maximize } from "lucide-react";

import { IFusionFeature } from "./types";

export const fusionFeatures: IFusionFeature[] = [
  {
    id: 1,
    title: "individuals",
    description: "Create & respond to personalized prompts to understand changes in your behavior over time",
    featuresList: [
      "Get recommendations from our copilot to guide your daily activities",
      "See insights on how your behavior changes with engaging personalized prompts",
      "Join quests, explore research to understand yourself better",
    ],
  },
  {
    id: 2,
    title: "coaches & health professionals",
    description: "See, with consent how clients respond to recommendations & plans outside of consults",
    featuresList: [
      "Automate medication scheduling for improved adherence",
      "Monitor symptoms in real-time for proactive care",
      "Effortlessly trial interventions for better outcomes",
    ],
  },
  {
    id: 3,
    title: "explorers & researchers",
    description: "Record experiments & design quests (a set of tasks other users can run) and share results",
    featuresList: [
      "A playground of exercises for recording brain & behavior data",
      "Design a set of tasks and their execution flow",
      "Run your data with available models & share your results",
      "Define methods that update study results as new data is gotten",
    ],
  },
];
