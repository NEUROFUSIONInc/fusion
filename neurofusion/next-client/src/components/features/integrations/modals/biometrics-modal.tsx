import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

import { Button } from "~/components/ui";
import { MuseClient } from "muse-js";

interface IBiometricsModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

async function connectDevice() {}

export const BiometricsModal: FC<IBiometricsModalProps> = ({ isOpen, onCloseModal }) => {
  const [deviceConfig, setDeviceConfig] = useState("");

  const connectMuse = async () => {
    const museClient = new MuseClient();
    await museClient.connect();
    await museClient.start();
    return museClient;
  };

  const handleConnect = () => {
    (async () => {
      console.log("connecting device");

      let client: MuseClient;
      try {
        client = await connectMuse();
        console.log(client);
        client.eegReadings.subscribe((reading) => {
          console.log(reading);
        });
        client.telemetryData.subscribe((telemetry) => {
          console.log(telemetry);
        });
        client.accelerometerData.subscribe((acceleration) => {
          console.log(acceleration);
        });
      } catch (err) {
        console.log(err);
      }
    })();
    // onCloseModal();
  };

  const updateDeviceConfig = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDeviceConfig(evt.target.value);
    console.log(evt.target.value);

    // this is where we invoke the brainflow connection
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
            Connect EEG Device with Brainflow
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-700 dark:text-gray-300 md:text-base">
            Enter details for your EEG device
            <Link href="https://brainflow.readthedocs.io/en/stable/SupportedBoards.html" target="_blank">
              Brainflow supported device details
            </Link>
          </Dialog.Description>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={onCloseModal}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <h4 className="font-body text-lg">Device Configurations</h4>
          <label htmlFor="countries" className="my-2 block text-sm font-medium text-gray-900 dark:text-white">
            Enter Device Config (JSON)
            <textarea
              id="countries"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
              rows={10}
              cols={50}
              onChange={updateDeviceConfig}
            ></textarea>
          </label>

          <div className="mt-8 flex w-full flex-wrap items-center gap-4 py-6 md:flex-nowrap">
            <Button type="submit" onClick={handleConnect}>
              Connect EEG Device
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
