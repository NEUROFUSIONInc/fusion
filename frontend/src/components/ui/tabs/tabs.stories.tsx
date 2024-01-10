import { Moon, Sun } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "./tabs";

export default { title: "UI/Tabs" };

export const Default = () => {
  return (
    <Tabs defaultValue="login">
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export const WithIcon = () => {
  return (
    <Tabs defaultValue="light">
      <TabsList>
        <TabsTrigger value="light">
          <Sun size={18} className="mr-3" /> Light
        </TabsTrigger>
        <TabsTrigger value="dark">
          <Moon size={18} className="mr-3" />
          Dark
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
