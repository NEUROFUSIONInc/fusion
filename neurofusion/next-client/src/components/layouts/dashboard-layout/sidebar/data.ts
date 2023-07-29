import { HardDrive, Laptop, LayoutDashboard, Moon, Plug, SignalHigh, Sun } from "lucide-react";

export const sidebarLinks = [
  {
    icon: LayoutDashboard,
    title: "Lab",
    href: "/lab/playground",
  },
  {
    icon: Plug,
    title: "Integrations",
    href: "/lab/integrations",
  },
  {
    icon: HardDrive,
    title: "Datasets",
    href: "/lab/datasets",
  },
  {
    icon: SignalHigh,
    title: "Analysis",
    href: "#",
  },
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
