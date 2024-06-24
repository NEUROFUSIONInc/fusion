import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FC, useState } from "react";

import { Button } from "~/components/ui";
import { updateNeurositySelectedDevice, useNeurosityState } from "~/hooks";

interface IFusionModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

export const FusionConnectModal: FC<IFusionModalProps> = ({ isOpen, onCloseModal }) => {
  const { devices, getNeurositySelectedDevice, disconnectNeurosityAccount } = useNeurosityState();
  const [neurositySelectedDevice] = useState(getNeurositySelectedDevice());

  const handleDisconnect = () => {
    disconnectNeurosityAccount();
    onCloseModal();
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50"
          onPointerDown={onCloseModal}
        />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 h-auto max-h-[85vh] w-[450px] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800 md:w-[600px]">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Connect Fusion Mobile Account
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-700 dark:text-gray-300 md:text-base">
            Follow the instructions below to connect your Fusion Mobile account.
          </Dialog.Description>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={onCloseModal}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <h4 className="font-body text-lg">Steps</h4>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
