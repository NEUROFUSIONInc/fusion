export interface IIntegration {
  slug: string;
  title: string;
  href: string;
  imageUrl: string;
  description: string;
  active: boolean;
}

export const integrations = [
  {
    slug: "fusion",
    title: "Fusion (Health & Behavior)",
    href: "https://usefusion.app/download",
    imageUrl: "/images/logo.png",
    description: "Connect your prompts, responses and health data from the Fusion Mobile App.",
    active: true,
  },
  {
    slug: "neurosity",
    title: "Neurosity (EEG Brain Data)",
    href: "https://neurosity.co",
    imageUrl: "/images/integrations/neurosity_icon_light.png",
    description:
      "Neurosity is a wearable device that measures EEG brain activity. It also predicts how focused & calm you are in a given moment.",
    active: true,
  },
  {
    slug: "biometrics",
    title: "Muse (EEG Brain Data)",
    href: "https://choosemuse.com",
    imageUrl: "/images/integrations/muse_logo.svg",
    description:
      "Muse is a wearable device that measures EEG brain activity. It measures data from temporal & frontal lobes.",
    active: true,
  },
  // {
  //   slug: "magicflow",
  //   title: "MagicFlow (Productivity)",
  //   href: "https://magicflow.com",
  //   imageUrl: "/images/integrations/magicflow_icon.webp",
  //   description: "MagicFlow is the productivity tracker that helps you focus on what matters most.",
  //   active: true,
  // },
  {
    slug: "activityWatch",
    title: "ActivityWatch (Screen Time)",
    href: "https://activitywatch.net",
    imageUrl: "/images/integrations/activitywatch_icon.png",
    description:
      "ActivityWatch is an open source, privacy first app that automatically tracks how you spend time on your devices.",
    active: true,
  },
  // {
  //   slug: "spotify",
  //   title: "Spotify (Music)",
  //   href: "https://spotify.com",
  //   imageUrl: "/images/integrations/spotify_icon_green.png",
  //   description:
  //     "A digital streaming service that gives you access to millions of songs and content from all over the world.",
  //   active: false,
  // },
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
