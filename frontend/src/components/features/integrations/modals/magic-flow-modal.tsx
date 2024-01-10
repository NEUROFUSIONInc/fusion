import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FC, useState } from "react";

import { magicFlowSteps } from "../data";

import { Button, Input } from "~/components/ui";
import { useGetMagicFlowToken } from "~/hooks";
import { magicflowService } from "~/services";

interface IMagicFlowModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

export const MagicFlowModal: FC<IMagicFlowModalProps> = ({ isOpen, onCloseModal }) => {
  const { data: sessionData } = useSession();
  const { data } = useGetMagicFlowToken();
  const [token, setToken] = useState(data?.magicflowToken || "");

  const { mutate } = useMutation({
    mutationKey: ["setMagicflowToken"],
    mutationFn: ({ token, authToken }: { token: string; authToken: string }) =>
      magicflowService.setMagicFlowToken(token, authToken),
    onSuccess: () => onCloseModal(),
  });

  const handleSubmit = () => mutate({ token, authToken: sessionData?.user?.authToken || "" });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => setToken(evt.target.value);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50"
          onPointerDown={onCloseModal}
        />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] z-30 h-auto max-h-[85vh] w-[450px] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800 md:w-[600px]">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Connect magicFlow account
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-700 dark:text-gray-300 md:text-base">
            Use your magic flow token to get started
          </Dialog.Description>

          <Dialog.Close
            className="absolute top-10 right-8 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={onCloseModal}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <h4 className="font-body text-lg">Steps</h4>
          <Accordion.Root type="single" collapsible className="divide-y dark:divide-slate-600">
            {magicFlowSteps.map((step) => (
              <Accordion.Item key={step.id} value={`step-${step.id}`}>
                <Accordion.Trigger className="flex w-full items-center justify-between py-4 transition-all [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-500 p-3 font-semibold text-white">
                      {step.id}
                    </div>
                    <p className="text-left font-medium">{step.step}</p>
                  </div>

                  <ChevronDown className="hidden transition-transform duration-200 sm:block" />
                </Accordion.Trigger>
                <Accordion.Content>
                  <Image src={step.image} alt="Magic Flow Home page" width={600} height={300} />
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <div className="mt-8 flex w-full flex-wrap items-center gap-4 py-6 md:flex-nowrap">
            <Input value={data?.magicflowToken} placeholder="magicFlow token" onChange={handleChange} fullWidth />
            <Button type="submit" onClick={handleSubmit}>
              {data?.magicflowToken ? "Update" : "Connect"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
