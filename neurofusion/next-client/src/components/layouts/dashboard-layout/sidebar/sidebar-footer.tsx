import { User } from "next-auth";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";

import { AccountMenu } from "./account-menu";
import { appearanceModes } from "./data";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui";

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
      <AccountMenu user={user} />
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
