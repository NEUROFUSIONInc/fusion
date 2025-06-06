import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const logoStyles = cva("w-5", {
  variants: {
    size: {
      sm: "w-8",
      md: "w-10",
      lg: "w-11",
      xl: "w-12",
      "2xl": "w-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface LinkProps extends VariantProps<typeof logoStyles> {
  withText?: boolean;
  className?: string;
  neuro?: boolean;
}

export const Logo: FC<LinkProps> = ({ withText, size, className, neuro }) => {
  return (
    <div className="inline-flex items-center">
      <img
        src="/images/logo.png"
        alt="Neurofusion Logo"
        width={80}
        height={80}
        className={logoStyles({ size, className })}
      />
      {withText && (
        <h2 className="ml-2 font-heading text-2xl font-medium leading-10 text-primary-900 dark:text-white">
          NEUROFUSION
        </h2>
      )}
    </div>
  );
};
