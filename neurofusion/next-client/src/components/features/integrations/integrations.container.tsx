import { useState } from "react";

import { integrations } from "./data";
import { Integration } from "./integration/integration";
import { MagicFlowModal } from "./modals";

import { useGetMagicFlowToken } from "~/hooks";

type ModalState = "magicFlow" | "neurosity" | "spotify" | undefined;
type IntegrationTitle = (typeof integrations)[number]["title"];

export const IntegrationsContainer = () => {
  const [modalOpen, setModalOpen] = useState<ModalState>();
  const { data: magicflowData, isLoading: magicflowLoading } = useGetMagicFlowToken();

  function handleIntegrationClick(integrationTitle: IntegrationTitle) {
    switch (integrationTitle) {
      case "Spotify":
        // call function for Spotify integration
        break;
      case "Neurosity":
        // call function for Neurosity integration
        break;
      case "MagicFlow":
        setModalOpen("magicFlow");
        break;
      case "Vital":
        // call function for Vital integration
        break;
      default:
      // handle default case (optional)
    }
  }

  const isIntegrationConnected = (integrationTitle: IntegrationTitle) => {
    switch (integrationTitle) {
      case "Spotify":
        // check if Spotify is connected
        return false;
      case "Neurosity":
        // check if Neurosity is connected
        return false;
      case "MagicFlow":
        // check if MagicFlow is connected
        return Boolean(magicflowData?.magicflowToken);
      case "Vital":
        // check if Vital is connected
        return false;
      default:
        return false;
    }
  };

  const integrationLoading = (integrationTitle: IntegrationTitle) => {
    switch (integrationTitle) {
      case "Spotify":
        // check if Spotify is connected
        return false;
      case "Neurosity":
        // check if Neurosity is connected

        return false;
      case "MagicFlow":
        // check if MagicFlow is connected
        return magicflowLoading;
      case "Vital":
        // check if Vital is connected
        return false;
      default:
        return false;
    }
  };

  return (
    <section>
      <h1 className="text-4xl">Integrations and all connected apps</h1>
      <p className="mt-2 mb-10 text-lg dark:text-slate-400">
        Supercharge your workflow and connect to tools you use everyday{" "}
      </p>
      <div className="flex flex-wrap gap-8">
        {integrations.map((integration) => (
          <Integration
            key={integration.title}
            integration={integration}
            onclick={() => handleIntegrationClick(integration.title)}
            isConnected={isIntegrationConnected(integration.title)}
            loading={integrationLoading(integration.title)}
          />
        ))}
      </div>
      <MagicFlowModal isOpen={modalOpen === "magicFlow"} onCloseModal={() => setModalOpen(undefined)} />
    </section>
  );
};
