import { HardDrive, Laptop, LayoutDashboard, Moon, Plug, SignalHigh, Sun } from "lucide-react";

export const sidebarLinks = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    href: "#",
  },
  {
    icon: Plug,
    title: "Integrations",
    href: "/integrations",
  },
  {
    icon: HardDrive,
    title: "Datasets",
    href: "#",
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
