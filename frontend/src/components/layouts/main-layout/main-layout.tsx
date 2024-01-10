import { FC, ReactNode } from "react";

import { Footer, Navbar } from "~/components/ui";
import { cn } from "~/utils";

interface MainLayoutProps {
  children?: ReactNode;
  dark?: boolean;
}
export const MainLayout: FC<MainLayoutProps> = ({ children, dark }) => {
  return (
    <div
      className={cn("min-h-screen bg-light-gradient dark:bg-dark-gradient", {
        "dark ": dark,
      })}
    >
      <Navbar />
      <main className="min-h-[60vh] w-full">{children}</main>
      <Footer />
    </div>
  );
};
