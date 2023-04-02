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
      <div className="flex space-x-3 p-4 md:hidden">
        <Button rightIcon={<Menu />} size="icon" intent="ghost" onClick={() => setMobileMenuOpen(true)} />
        <Logo className="w-7" />
      </div>
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <main className="container relative mx-auto w-screen flex-1 overflow-y-auto p-4 focus:outline-none md:w-full md:p-8">
        {children}
      </main>

      <MobileMenu open={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)} />
    </div>
  );
};
