import { MuseClient } from "muse-js";
import { useState, createContext } from "react";
import { connectMuse } from "~/services/integrations/muse.service";

export const MuseContext = createContext<null | {
  museClient: MuseClient | null;
  getMuseClient: () => void;
}>(null);

const TestContext = createContext(null);

export const MuseContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [museClient, setMuseClient] = useState<MuseClient | null>(null);
  const getMuseClient = async () => {
    console.log("connecting muse device");
    const muse = await connectMuse();
    setMuseClient(muse);
  };

  return <MuseContext.Provider value={{ museClient, getMuseClient }}>{children}</MuseContext.Provider>;
};
