import { FC, ReactNode } from "react";

import { Footer, Navbar } from "~/components/ui";
import { cn } from "~/utils";

interface MainLayoutProps {
  children?: ReactNode;
  dark?: boolean;
  isResearch?: boolean;
}
export const MainLayout: FC<MainLayoutProps> = ({ children, dark, isResearch }) => {
  return (
    <div
      className={cn("min-h-screen bg-light-gradient dark:bg-dark-gradient", {
        "dark ": dark,
      })}
    >
      <Navbar isResearch={isResearch} />
      <main className="min-h-[60vh] w-full">{children}</main>
      <Footer isResearch={isResearch} />
    </div>
  );
};
