import React, { FC, ReactNode, useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "./sidebar/sidebar";
import { MobileMenu } from "./sidebar/mobile-menu";

import { Button, Logo } from "~/components/ui";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden md:flex-row">
      <div
        className="sticky left-0 right-0 top-0 z-10 flex h-16 w-full items-center
      justify-between space-x-3 bg-opacity-50 p-4 backdrop-blur-lg md:hidden"
      >
        <Logo className="w-8" />
        <Button rightIcon={<Menu />} size="icon" intent="ghost" onClick={() => setMobileMenuOpen(true)} />
      </div>
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <main className="container relative mx-auto w-screen flex-1 overflow-y-auto p-4 focus:outline-none md:w-full md:p-9">
        {children}
      </main>

      <MobileMenu open={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)} />
    </div>
  );
};
