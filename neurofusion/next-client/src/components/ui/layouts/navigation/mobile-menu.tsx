import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

import { Button } from "../../button/button";
import { Logo } from "../../logo/logo";

import { navigationLinks } from "./data";

import { cn } from "~/utils";

interface IMobileMenuProps {
  open?: boolean;
  onMobileMenuClose: () => void;
}

export const MobileMenu: FC<IMobileMenuProps> = ({ open, onMobileMenuClose }) => {
  const router = useRouter();

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-0 right-0 top-0 z-30 h-full w-full bg-white p-4 focus:outline-none dark:bg-dark-gradient md:hidden">
          <div className="flex items-center justify-between">
            <Logo withText />
            <Button
              title="Close mobile menu"
              aria-labelledby="mobile-menu-button"
              rightIcon={<X />}
              size="icon"
              intent="ghost"
              onClick={onMobileMenuClose}
            />
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/50">
              <div className="py-6">
                {navigationLinks.map((link) => {
                  const active = link.href === router.pathname;
                  return (
                    <Link
                      key={link.title}
                      href={`${link.href}`}
                      className={cn(
                        "ml-8 block py-2 text-base font-normal leading-7 text-gray-500 opacity-80 last:mr-8 hover:text-primary-900 hover:opacity-100 dark:text-primary-50 dark:hover:text-white",
                        {
                          "font-medium text-gray-950 opacity-100 hover:text-gray-950": active,
                        }
                      )}
                    >
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
