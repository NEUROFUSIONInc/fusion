import React, { FC } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { sidebarLinks } from "./data";
import { SidebarFooter } from "./sidebar-footer";

import { Logo } from "~/components/ui";

export const Sidebar: FC = () => {
  const { data: session } = useSession();
  const { pathname } = useRouter();

  return (
    <aside
      className="max-w-64 flex h-screen w-full flex-col border-r-gray-200 bg-white py-7 px-5 transition-transform dark:border-r-slate-800/70 dark:bg-slate-800/25 md:border-r lg:w-72"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <Logo withText size="md" />
        <nav className="mt-6 flex flex-grow">
          {" "}
          <ul className="w-full space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className={classNames(
                    "flex items-center rounded-lg border border-transparent p-2 text-sm font-semibold text-gray-600 hover:bg-slate-100/70 hover:text-dark dark:text-slate-200 dark:hover:border-slate-700/50 dark:hover:bg-slate-800/60 dark:hover:text-white",
                    {
                      "bg-slate-100 text-dark dark:bg-slate-800": pathname === link.href,
                    }
                  )}
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
        <SidebarFooter user={session?.user} />
      </div>
    </aside>
  );
};
