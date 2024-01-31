import { MuseClient } from "muse-js";
import { useState, createContext } from "react";

export const MuseContext = createContext<null | {
  museClient: MuseClient | null;
  getMuseClient: () => void;
}>(null);

const TestContext = createContext(null);

export const MuseContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [museClient, setMuseClient] = useState<MuseClient | null>(null);

  const getMuseClient = async () => {
    console.log("connecting muse device");
    const museClient = new MuseClient();
    await museClient.connect();
    setMuseClient(museClient);
  };

  return <MuseContext.Provider value={{ museClient, getMuseClient }}>{children}</MuseContext.Provider>;
};
