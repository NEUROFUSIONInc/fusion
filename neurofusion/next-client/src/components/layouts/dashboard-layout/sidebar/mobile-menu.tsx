import * as Dialog from "@radix-ui/react-dialog";
import { FC } from "react";
import { X } from "lucide-react";

import { Sidebar } from "./sidebar";

import { Button } from "~/components/ui";

interface IMobileMenuProps {
  open?: boolean;
  onMobileMenuClose: () => void;
}

export const MobileMenu: FC<IMobileMenuProps> = ({ open, onMobileMenuClose }) => {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal className="relative">
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-0 left-0 right-0 z-30 h-full w-full bg-white p-4 focus:outline-none dark:bg-dark-gradient md:hidden">
          <Sidebar />
          <Button
            rightIcon={<X />}
            size="icon"
            intent="ghost"
            onClick={onMobileMenuClose}
            className="fixed -top-full left-[90%]"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
