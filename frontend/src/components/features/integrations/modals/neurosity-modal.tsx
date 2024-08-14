import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FC, useState } from "react";

import { Button } from "~/components/ui";
import { updateNeurositySelectedDevice, useNeurosityState } from "~/hooks";

interface INeurosityModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

export const NeurosityModal: FC<INeurosityModalProps> = ({ isOpen, onCloseModal }) => {
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
            Update Neurosity account
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-700 dark:text-gray-300 md:text-base">
            Select a device to update your Neurosity account
          </Dialog.Description>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={onCloseModal}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <h4 className="font-body text-lg">Devices</h4>
          <label htmlFor="countries" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
            Choose a device
            <select
              id="countries"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
              onChange={updateNeurositySelectedDevice}
            >
              <option value="">Select a device</option>
              {devices.map((device) => {
                if (device.deviceId === neurositySelectedDevice) {
                  return (
                    <option key={device.deviceId} value={device.deviceId} selected>
                      {device.deviceNickname}
                    </option>
                  );
                } else {
                  return (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.deviceNickname}
                    </option>
                  );
                }
              })}
            </select>
          </label>

          {/* <h4 className="font-body text-lg">Recordings</h4>
          <label htmlFor="backgroundRecording" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
            Allow NeuroFusion to start recordings when your Neurosity device turns on automatically
            <select
              id="backgroundRecording"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">Choose option</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label> */}

          <div className="mt-8 flex w-full flex-wrap items-center gap-4 py-6 md:flex-nowrap">
            <Button type="submit" onClick={handleDisconnect}>
              Disconnect Neurosity account
            </Button>

            <Button
              type="submit"
              onClick={() => {
                window.location.href = "/recordings";
              }}
            >
              Go to Recordings
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
