import React, { FC } from "react";
import Link from "next/link";

import { Logo } from "~/components/ui";

import { sidebarLinks } from "./data";
import { SidebarFooter } from "./sidebar-footer";

export const Sidebar: FC = () => {
  return (
    <aside
      className="max-w-64 flex h-screen w-full flex-col border-r-gray-200 bg-white py-7 px-5 transition-transform dark:border-r-slate-800/70 dark:bg-slate-800/25 md:border-r lg:w-72"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <Logo withText size="sm" />
        <nav className="mt-6 flex flex-grow">
          {" "}
          <ul className="w-full space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="flex items-center rounded-lg border border-transparent p-2 text-sm font-semibold text-gray-600 hover:bg-slate-100/95 hover:text-dark dark:text-slate-200 dark:hover:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <link.icon size={19} />
                  <span className="ml-3">{link.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex flex-shrink-0">
        <SidebarFooter />
      </div>
    </aside>
  );
};
