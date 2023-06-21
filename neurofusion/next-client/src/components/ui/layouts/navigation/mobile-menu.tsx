import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

import { Button } from "../../button/button";
import { ButtonLink } from "../../link/button-link";
import { Logo } from "../../logo/logo";

import { navigationLinks } from "./data";

interface IMobileMenuProps {
  open?: boolean;
  onMobileMenuClose: () => void;
}

export const MobileMenu: FC<IMobileMenuProps> = ({ open, onMobileMenuClose }) => {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-0 right-0 top-0 z-30 h-full w-full bg-white p-4 focus:outline-none dark:bg-dark-gradient md:hidden">
          <div className="flex items-center justify-between">
            <Logo withText />
            <Button rightIcon={<X />} size="icon" intent="ghost" onClick={onMobileMenuClose} />
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/50">
              <div className="py-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={`${link.href}`}
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
              {/* <div className="py-8">
                <ButtonLink href="/auth/login" rounded rightIcon={<ArrowRight size={16} />} fullWidth>
                  Login
                </ButtonLink>
              </div> */}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
