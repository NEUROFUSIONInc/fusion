import { Maximize } from "lucide-react";

import { IFusionFeature } from "./types";

export const fusionFeatures: IFusionFeature[] = [
  {
    id: 1,
    title: "personal well-being",
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
      "Simplify medication management for you and your clients with automated scheduling and adherence tracking",
      "Monitor symptoms/side-effects in real-time to address concerns",
      "Improve client care with ease by trialing interventions and treatment plans",
    ],
  },
  {
    id: 3,
    title: "explorers & researchers",
    description: "Record experiments & design quests (a set of tasks other users can run) and share results",
    featuresList: [
      "Engaging experiments for recording brain & behavior data",
      "Instant analysis for recorded data",
      "Design custom experiments other users can run",
      "Publish your results & models for other to run with their data",
    ],
  },
];
