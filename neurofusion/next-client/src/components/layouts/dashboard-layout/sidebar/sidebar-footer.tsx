import { ChevronsUpDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, Tabs, TabsList, TabsTrigger } from "~/components/ui";

import { appearanceModes } from "./data";

export const SidebarFooter = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="mx-auto flex w-full flex-col items-stretch space-y-5 rounded-none md:w-64 lg:w-72">
      <div className="group relative flex w-full items-center justify-between rounded-md border p-2 hover:cursor-pointer hover:bg-slate-50 dark:border-slate-700/60 dark:hover:border-transparent dark:hover:bg-slate-800">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback className="">KO</AvatarFallback>
          </Avatar>
          <div className="flex-flex-col">
            <p className="text-[14px] font-medium">kelechi o</p>
            <p className=" max-w-[120px] truncate text-[12.5px] text-slate-600 dark:text-slate-400 lg:max-w-[160px]">
              kelechio@someting.com
            </p>
          </div>
        </div>
        <div className="absolute top-auto right-2">
          <ChevronsUpDown size={18} />
        </div>
      </div>
      <Tabs defaultValue={theme} className="w-full">
        <TabsList className="w-full">
          {appearanceModes.map((mode) => (
            <TabsTrigger
              key={mode.value}
              value={mode.value}
              title={`${mode.value} mode`}
              className="min-w-[80px] cursor-pointer sm:min-w-[82px]"
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
