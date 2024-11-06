import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui";

const OnboardingModal: React.FC = () => {
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [showDataHandlingModal, setShowDataHandlingModal] = useState(false);

  useEffect(() => {
    const viewedOnboarding = localStorage.getItem("viewedOnboarding");
    if (viewedOnboarding !== "true") {
      setShowCapabilitiesModal(true);
    }
  }, []);

  const handleCapabilitiesNext = () => {
    setShowCapabilitiesModal(false);
    setShowDataHandlingModal(true);
  };

  const handleDataHandlingPrevious = () => {
    setShowCapabilitiesModal(true);
    setShowDataHandlingModal(false);
  };

  const handleDataHandlingGetStarted = () => {
    setShowDataHandlingModal(false);
    localStorage.setItem("viewedOnboarding", "true");
  };

  const handleCloseCapabilities = () => {
    setShowCapabilitiesModal(false);
  };

  const handleCloseDataHandling = () => {
    setShowDataHandlingModal(false);
  };
  return (
    <div>
      {showCapabilitiesModal && (
        <CapabilitiesModal onNext={handleCapabilitiesNext} onCancel={handleCloseCapabilities} />
      )}
      {showDataHandlingModal && (
        <DataHandlingModal
          onPrevious={handleDataHandlingPrevious}
          onGetStarted={handleDataHandlingGetStarted}
          onClose={handleCloseDataHandling}
        />
      )}
    </div>
  );
};

interface CapabilitiesModalProps {
  onNext: () => void;
  onCancel: () => void;
}

const CapabilitiesModal: React.FC<CapabilitiesModalProps> = ({ onNext, onCancel }) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>Welcome to Fusion</DialogTitle>
        <DialogDescription>
          Here's what you can do with Fusion:
          <div className="list-disc ml-6 mt-2">
            <p>Record brain activity during cognitive experiments</p>
            <p>Respond to prompts on mobile devices</p>
          </div>
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button intent="primary" onClick={onNext}>
            Next
          </Button>
          <Button intent="dark" onClick={onCancel} className="ml-2">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface DataHandlingModalProps {
  onPrevious: () => void;
  onGetStarted: () => void;
  onClose: () => void;
}

const DataHandlingModal: React.FC<DataHandlingModalProps> = ({ onPrevious, onGetStarted, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Data Handling in Fusion</DialogTitle>
        <DialogDescription>
          How Fusion handles your data:
          <ul className="list-disc ml-6 mt-2">
            <li>Assigns anonymous identities with no email required</li>
            <li>Stores data locally on your device</li>
          </ul>
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button intent="primary" onClick={onGetStarted} className="ml-2">
            Get Started
          </Button>
          <Button intent="dark" onClick={onPrevious}>
            Previous
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CapabilitiesModal, DataHandlingModal, OnboardingModal };
