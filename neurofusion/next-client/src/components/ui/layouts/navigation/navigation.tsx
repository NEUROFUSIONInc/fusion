import Link from "next/link";
import { FC } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "../../logo/logo";
import { ButtonLink } from "../../link/button-link";

import { navigationLinks } from "./data";

export const Navbar: FC = () => {
  return (
    <header className="w-full bg-opacity-50 backdrop-blur-[12px]">
      <nav className="border-0.5 container mx-auto flex items-center justify-between p-3 backdrop-blur-md backdrop-filter after:absolute after:inset-x-0 after:z-[-1] after:h-12 after:w-full">
        <Logo withText />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {navigationLinks.map((link) => (
              <Link
                key={link.title}
                href={`/${link.href}`}
                className="ml-8 text-[14.5px] font-medium text-primary-800 opacity-90 last:mr-8 hover:text-primary-900 hover:opacity-100 dark:text-primary-50 dark:hover:text-white"
              >
                {link.title}
              </Link>
            ))}
          </div>
          <ButtonLink href="/auth/login" rounded rightIcon={<ArrowRight size={16} />}>
            Login
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
};
