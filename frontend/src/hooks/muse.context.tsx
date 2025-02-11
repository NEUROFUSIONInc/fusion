import { MuseClient } from "muse-js";
import { useState, createContext } from "react";
import { MuseEEGService } from "~/services/integrations/muse.service";

export const MuseContext = createContext<null | {
  museClient: MuseClient | null;
  getMuseClient: () => void;
  museService: MuseEEGService | null;
}>(null);

export const MuseContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [museClient, setMuseClient] = useState<MuseClient | null>(null);
  const [museService, setMuseService] = useState<MuseEEGService | null>(null);

  const getMuseClient = async () => {
    console.log("connecting muse device");
    const museClient = new MuseClient();

    try {
      museClient.enablePpg = false;
    } catch (e) {
      console.error("ppg is not supported");
    }

    await museClient.connect();
    const museEEGService = new MuseEEGService(museClient);
    setMuseService(museEEGService);
    setMuseClient(museClient);
  };

  return <MuseContext.Provider value={{ museClient, getMuseClient, museService }}>{children}</MuseContext.Provider>;
};
