import { IQuest } from "~/@types";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";

interface ShareModalProps {
  quest: IQuest;
  displayShareModal: boolean;
  setDisplayShareModal: (value: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ quest, displayShareModal, setDisplayShareModal }) => {
  return (
    <Dialog open={displayShareModal} onOpenChange={() => setDisplayShareModal(!displayShareModal)}>
      <DialogContent>
        <DialogTitle>Join Quest</DialogTitle>
        <DialogDescription>Enter this code on the Fusion Copilot App to join this quest</DialogDescription>
        <div className="flex flex-col space-y-4">
          <Input label="Join Code" type="text" size="lg" value={quest.joinCode} readOnly />
          <Button size="lg" fullWidth>
            Copy Join Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
