import { HardDrive, Laptop, LayoutDashboard, MessageSquare, Moon, PenBox, Plug, SignalHigh, Sun } from "lucide-react";

export const sidebarLinks = [
  // {
  //   icon: MessageSquare,
  //   title: "Prompts",
  //   href: "/prompts",
  // },
  {
    icon: LayoutDashboard,
    title: "Recording",
    href: "/playground",
  },
  {
    icon: SignalHigh,
    title: "Analysis",
    href: "/analysis",
  },
  // {
  //   icon: HardDrive,
  //   title: "Datasets",
  //   href: "/datasets",
  // },
  {
    icon: PenBox,
    title: "Quests",
    href: "/quests",
  },
  // {
  //   icon: Plug,
  //   title: "Integrations",
  //   href: "/integrations",
  // },
];

export const appearanceModes = [
  {
    icon: Moon,
    value: "dark",
  },
  {
    icon: Sun,
    value: "light",
  },
  {
    icon: Laptop,
    value: "system",
  },
];
