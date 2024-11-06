import { Maximize } from "lucide-react";

import { IFusionFeature } from "./types";

export const fusionFeatures: IFusionFeature[] = [
  {
    id: 1,
    pretitle: "Use",
    title: "fusion copilot to",
    description: "Understand changes in your behavior over time with personalized prompts.",
    featuresList: [
      "Get recommendations to meet your daily goals",
      "Understand the impact of daily activities on your health and performance",
      "Reflect in one-click, even on your busiest days",
      "Share reports with your friends & family",
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
    title: "researchers",
    description: "Record experiments & design quests (a set of tasks other users can run) and share results",
    featuresList: [
      "Engaging experiments for recording brain & behavior data with instant analysis",
      "Design custom experiments people can run anywhere in the world",
      "Curate open datasets & models for others to use",
    ],
  },
];
