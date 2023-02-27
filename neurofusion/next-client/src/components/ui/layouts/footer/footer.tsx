import React from "react";
import Link from "next/link";

import { Logo } from "../../logo/logo";

import { footerLinks } from "./data";

export const Footer = () => {
  return (
    <footer className="border-t border-t-gray-200 dark:border-t-gray-800">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto flex flex-col items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <Logo />
        <nav className="my-6 flex  flex-wrap justify-center" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.title}
              href={`/${link.href}`}
              className="ml-8 text-[14.5px] font-medium text-primary-800 opacity-90 last:mr-8 hover:text-primary-900 hover:opacity-100 dark:text-primary-50 dark:hover:text-white"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        <p className="text-center">
          <span className="mx-auto mt-2 text-[14.5px] text-gray-600 dark:text-gray-400">
            © NEUROFUSION Research Inc. All rights reserved. {new Date().getFullYear()}
          </span>
        </p>
      </div>
    </footer>
  );
};
