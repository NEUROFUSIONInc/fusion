import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";

import { Button } from "../../button/button";
import { Logo } from "../../logo/logo";

import { navigationLinks } from "./data";
import { MobileMenu } from "./mobile-menu";

import { cn } from "~/utils";

export const Navbar: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky left-0 right-0 top-0 z-10 flex h-16 w-full items-center border-b border-b-gray-50/20 bg-white/50 shadow-sm dark:bg-transparent backdrop-blur-lg dark:border-b-gray-800 dark:border-opacity-50">
      <nav className="container mx-auto flex items-center justify-between px-6 py-7 md:px-4">
        <Logo withText />
        <div className="hidden items-center justify-between md:flex">
          <div className="flex items-center">
            {navigationLinks.map((link) => {
              const active = link.href === router.pathname;

              return (
                <Link
                  key={link.title}
                  href={`${link.href}`}
                  className={cn(
                    "ml-8 text-base font-normal text-gray-500 opacity-80 hover:text-primary-900 hover:opacity-100 dark:text-primary-50 dark:hover:text-white",
                    {
                      "font-medium text-gray-950 opacity-100 hover:text-gray-950": active,
                    }
                  )}
                  target={link.external ? "_blank" : undefined}
                >
                  {link.title}
                </Link>
              );
            })}
          </div>
        </div>
        <Button
          aria-labelledby="mobile-menu-button"
          title="Open mobile menu"
          rightIcon={<Menu strokeWidth={2} />}
          size="icon"
          intent="ghost"
          className="flex md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        />
      </nav>
      <MobileMenu open={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};
