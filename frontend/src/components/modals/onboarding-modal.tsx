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
        <DialogTitle>Welcome to NeuroFusion Explorer</DialogTitle>
        <DialogDescription>
          Here's what you can do with our tools:
          <div className="list-disc ml-6 mt-2">
            <p>Record brain activity during cognitive experiments</p>
            <p>Respond to self-reports on behavior using your mobile devices</p>
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
        <DialogTitle>Data Handling</DialogTitle>
        <DialogDescription>
          How we handle your data:
          <ul className="list-disc ml-6 mt-2">
            <li>You are assigned an anonymous identity with no email required</li>
            <li>Your data is stored data locally on your device unless you choose to share it with a researcher</li>
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
