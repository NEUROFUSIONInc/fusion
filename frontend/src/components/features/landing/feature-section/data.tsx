import { IFusionFeature } from "./types";

export const fusionFeatures: IFusionFeature[] = [
  {
    id: 1,
    pretitle: "For",
    title: "Personal Growth",
    description: "Track and optimize your daily performance with AI-powered insights.",
    featuresList: [
      "Receive personalized recommendations to achieve your health goals",
      "Visualize how lifestyle choices impact your cognitive performance",
      "Capture daily reflections with minimal effort, even on busy days",
      "Securely share your progress with trusted contacts and healthcare providers",
    ],
  },
  {
    id: 2,
    title: "Healthcare Professionals",
    description: "Monitor client progress between sessions with real-time, consent-based insights.",
    featuresList: [
      "Streamline medication management with automated reminders and adherence tracking",
      "Detect and address side effects or symptoms as they emerge",
      "Evaluate treatment effectiveness with objective data-driven feedback",
      "Deliver targeted recommendations based on individual client needs",
    ],
  },
  {
    id: 3,
    title: "Scientific Research",
    description: "Design, deploy, and analyze neuroscience experiments with powerful collaborative tools.",
    featuresList: [
      "Create engaging protocols that capture high-quality brain and behavioral data",
      "Deploy remote experiments to participants worldwide with standardized protocols",
      "Build and share open-source datasets and analytical models",
      "Generate publication-ready visualizations of your research findings",
    ],
  },
];
