import classNames from "classnames";
import { FC, ReactNode } from "react";

import { Navbar } from "~/components/ui";

interface MainLayoutProps {
  children?: ReactNode;
  dark?: boolean;
}
export const MainLayout: FC<MainLayoutProps> = ({ children, dark }) => {
  return (
    <div
      className={classNames("min-h-screen bg-light-gradient dark:bg-dark-gradient", {
        "dark ": dark,
      })}
    >
      <Navbar />
      <main className="min-h-[50vh] w-full">{children}</main>
    </div>
  );
};
