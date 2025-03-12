import { User } from "next-auth";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";

import { appearanceModes } from "./data";

import { Avatar, AvatarFallback, AvatarImage, CustomLink, Tabs, TabsList, TabsTrigger } from "~/components/ui";
import Link from "next/link";

interface ISidebarFooterProps {
  user?: User;
}

export const SidebarFooter: FC<ISidebarFooterProps> = ({ user }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="mx-auto flex w-full flex-col items-stretch space-y-5 rounded-none md:w-64 lg:w-72">
      <CustomLink store="docs" className="w-full md:w-auto" />

      <Link href="/profile">
        <div className="dark:border-slate-700/60 group relative flex w-full items-center justify-between rounded-md border p-2 hover:cursor-pointer hover:bg-slate-50 dark:hover:border-transparent dark:hover:bg-slate-800">
          <div className="flex items-center space-x-4">
            <Avatar>
              {user?.image && <AvatarImage src={user?.image} alt={user?.name || "User Avatar"} />}
              <AvatarFallback>{user?.name?.substring(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-flex-col">
              <p className="w-[90%] text-[14px] font-medium">{user?.name?.slice(0, 8) + ":" + user?.name?.slice(-8)}</p>
            </div>
          </div>
        </div>
      </Link>
      <Tabs defaultValue={theme} className="w-full">
        <TabsList className="w-full">
          {appearanceModes.map((mode) => (
            <TabsTrigger
              key={mode.value}
              value={mode.value}
              title={`${mode.value} mode`}
              className="sm:min-w-[82px] min-w-[80px] cursor-pointer"
              onMouseDown={() => setTheme(mode.value)}
            >
              <mode.icon size={20} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
