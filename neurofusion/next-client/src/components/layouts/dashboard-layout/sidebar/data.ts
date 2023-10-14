import { HardDrive, Laptop, LayoutDashboard, MessageSquare, Moon, PenBox, Plug, SignalHigh, Sun } from "lucide-react";

export const sidebarLinks = [
  // {
  //   icon: MessageSquare,
  //   title: "Prompts",
  //   href: "/prompts",
  // },
  {
    icon: LayoutDashboard,
    title: "Lab",
    href: "/playground",
  },
  // {
  //   icon: HardDrive,
  //   title: "Datasets",
  //   href: "/datasets",
  // },
  // {
  //   icon: PenBox,
  //   title: "Quests",
  //   href: "/quests",
  // },
  {
    icon: Plug,
    title: "Integrations",
    href: "/integrations",
  },
  // {
  //   icon: SignalHigh,
  //   title: "Analysis",
  //   href: "#",
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
