import { useState } from "react";

import { integrations } from "./data";
import { Integration } from "./integration/integration";
import { MagicFlowModal, NeurosityModal } from "./modals";

import { useGetMagicFlowToken, useNeurosityState } from "~/hooks";

type ModalState = "fusion" | "neurosity" | "magicflow" | "activitywatch" | "spotify" | undefined;
type IntegrationSlug = (typeof integrations)[number]["slug"];

export const IntegrationsContainer = () => {
  const [modalOpen, setModalOpen] = useState<ModalState>();
  const { data: magicflowData, isLoading: magicflowLoading } = useGetMagicFlowToken();
  const { user, loading: neurosityLoading, connectNeurosityAccount } = useNeurosityState();

  function handleIntegrationClick(integrationSlug: IntegrationSlug) {
    switch (integrationSlug) {
      case "fusion":
        // call function for fusion integration
        break;
      case "neurosity":
        if (user) {
          setModalOpen("neurosity");
        } else {
          connectNeurosityAccount();
        }
        break;
      case "magicflow":
        setModalOpen("magicflow");
        break;
      case "activitywatch":
        // call function for activitywatch integration
        break;
      case "spotify":
        // call function for spotify integration
        break;
      default:
      // handle default case (optional)
    }
  }

  const isIntegrationConnected = (integrationSlug: IntegrationSlug) => {
    switch (integrationSlug) {
      case "fusion":
        // check if fusion is connected
        return false;
      case "spotify":
        // check if Spotify is connected
        return false;
      case "neurosity":
        // check if Neurosity is connected
        return Boolean(user);
      case "magicflow":
        // check if MagicFlow is connected
        return Boolean(magicflowData?.magicflowToken);
      case "activitywatch":
        // check if Vital is connected
        return false;
      default:
        return false;
    }
  };

  const integrationLoading = (integrationSlug: IntegrationSlug) => {
    switch (integrationSlug) {
      case "fusion":
        // check if fusion is connected
        return false;
      case "spotify":
        // check if Spotify is connected
        return false;
      case "neurosity":
        // check if Neurosity is connected
        return neurosityLoading;
      case "magicflow":
        // check if MagicFlow is connected
        return magicflowLoading;
      case "activitywatch":
        // check if Vital is connected
        return false;
      default:
        return false;
    }
  };

  return (
    <section>
      <h1 className="text-4xl">Integrations and all connected apps</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">
        Supercharge your workflow and connect to tools you use everyday{" "}
      </p>
      <div className="flex flex-wrap gap-8">
        {integrations.map((integration) => (
          <Integration
            key={integration.slug}
            integration={integration}
            onclick={() => handleIntegrationClick(integration.slug)}
            isConnected={isIntegrationConnected(integration.slug)}
            loading={integrationLoading(integration.slug)}
          />
        ))}
      </div>
      {modalOpen === "magicflow" && (
        <MagicFlowModal isOpen={modalOpen === "magicflow"} onCloseModal={() => setModalOpen(undefined)} />
      )}
      {modalOpen === "neurosity" && (
        <NeurosityModal isOpen={modalOpen === "neurosity"} onCloseModal={() => setModalOpen(undefined)} />
      )}
    </section>
  );
};
