export interface IIntegration {
  title: string;
  href: string;
  imageUrl: string;
  description: string;
  active: boolean;
}

export const integrations = [
  {
    title: "Spotify",
    href: "https://spotify.com",
    imageUrl: "/images/integrations/spotify_icon_green.png",
    description:
      "A digital streaming service that gives you access to millions of songs and content from all over the world.",
    active: false,
  },
  {
    title: "Neurosity",
    href: "https://neurosity.co",
    imageUrl: "/images/integrations/neurosity_icon_light.png",
    description:
      "Neurosity is a wearable device that helps you train your brain to be more focused, calm, and productive.",
    active: true,
  },
  {
    title: "MagicFlow",
    href: "https://magicflow.com",
    imageUrl: "/images/integrations/magicflow_icon.webp",
    description: "MagicFlow is the productivity tracker that helps you focus on what matters most.",
    active: true,
  },
  {
    title: "Vital",
    href: "https://tryvital.io",
    imageUrl: "/images/integrations/vital_icon_light.png",
    description: "Connect your health data from Apple Health, Fitbit, Oura and more through Vital.",
    active: true,
  },
] as const;

export const magicFlowSteps = [
  {
    id: 1,
    step: "Open the app and click the settings gear",
    image: "/images/integrations/magicflow_home.png",
  },
  {
    id: 2,
    step: 'Click "Show API Credentials"',
    image: "/images/integrations/magicflow_credentials.png",
  },
  {
    id: 3,
    step: "Copy refresh token and paste below",
    image: "/images/integrations/magicflow_token.png",
  },
];
