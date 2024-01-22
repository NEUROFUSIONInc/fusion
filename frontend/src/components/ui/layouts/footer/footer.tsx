import Link from "next/link";
import React from "react";

import { Logo } from "../../logo/logo";

import { footerLinks } from "./data";
import { MsPartner } from "./ms-partner";
import { Newsletter } from "./newsletter/newsletter";

export const Footer = ({ isResearch = false }) => {
  return (
    <footer className="border-t border-t-gray-200 bg-gray-100/90 dark:border-t-gray-800 dark:bg-dark/10">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto flex flex-col items-center space-y-6 overflow-hidden px-4 pt-16 sm:px-6 lg:px-8">
        {isResearch ? <Logo withText neuro /> : <Logo withText />}
        <Newsletter />
        <MsPartner />

        <div className="flex w-full flex-col-reverse items-center justify-between border-t border-t-gray-200 pb-4 md:flex-row">
          <p className="text-center">
            <span className="mx-auto mt-2 text-[15px] text-gray-500/90 dark:text-gray-400 md:text-base">
              © NEUROFUSION Research Inc. All rights reserved. {new Date().getFullYear()}
            </span>
          </p>
          <nav className="my-6 flex flex-wrap justify-center" aria-label="Footer">
            {footerLinks.map((link) => (
              <Link
                key={link.title}
                href={`${link.href}`}
                className="ml-6 text-[14.5px] font-normal text-gray-500 opacity-90 hover:text-primary-900 hover:opacity-100 dark:text-primary-50 dark:hover:text-white"
                target={link.external ? "_blank" : undefined}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
