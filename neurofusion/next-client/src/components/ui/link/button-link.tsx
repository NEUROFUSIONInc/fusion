import { UrlObject } from "url";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, FC } from "react";

import { ButtonProps, buttonStyles } from "../button/button";

import { cn } from "~/utils";

interface BLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">, LinkProps {
  href: string | UrlObject;
}

type ButtonLinkProps = ButtonProps & BLinkProps;

export const ButtonLink: FC<ButtonLinkProps> = ({
  children,
  href,
  isLoading = false,
  intent = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  rounded,
  className,
  ...props
}) => {
  return (
    <Link
      href={href}
      className={cn(
        buttonStyles({
          fullWidth,
          intent,
          size,
          isLoading,
          rounded,
          className,
        }),
        "focus:ring-offset-0",
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
};
