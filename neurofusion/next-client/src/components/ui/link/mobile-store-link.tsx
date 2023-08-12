import { VariantProps, cva } from "class-variance-authority";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, FC } from "react";

import { cn } from "~/utils";

const mobileLinkStyles = cva(
  "inline-flex items-center justify-center gap-1 font-normal relative rounded px-5 py-4 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed min-w-max focus:ring-offset-2",
  {
    variants: {
      variant: {
        filled: "bg-indigo text-white focus:ring-indigo/50 hover:opacity-90 border-none",
        outlined:
          "bg-transparent text-indigo focus:outline-0 border-2 border-indigo focus:ring-0 focus-visible:ring-indigo focus-visible:ring-2 dark:focus-visible:ring-secondary-100 focus:ring-transparent focus:outline-none hover:bg-indigo hover:text-white",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

interface MobileStoreLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Omit<LinkProps, "href">,
    VariantProps<typeof mobileLinkStyles> {
  store?: "apple" | "google";
}

export const MobileStoreLink: FC<MobileStoreLinkProps> = ({ variant, store = "apple", className, ...props }) => {
  const strokeColor = variant === "filled" ? "white" : "currentColor";
  function getStoreInfo(store: "apple" | "google") {
    switch (store) {
      case "apple":
        return {
          href: "https://apps.apple.com/ca/app/usefusion/id6445860500?platform=iphone",
          icon: (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="&#240;&#159;&#166;&#134; icon &#34;brand apple&#34;">
                <path
                  id="Vector"
                  d="M6.50004 5.16664C4.50004 5.16664 3.83337 7.16664 3.83337 8.8333C3.83337 10.8333 5.16671 13.8333 6.50004 13.8333C7.22537 13.8026 7.61937 13.5 8.50004 13.5C9.37471 13.5 9.50004 13.8333 10.5 13.8333C11.5 13.8333 13.1667 11.8333 13.1667 10.5C13.148 10.4933 11.5187 10.2313 11.5 8.49997C11.4874 7.0533 13.1107 6.53064 13.1667 6.49997C12.4847 5.5053 11.1994 5.1913 10.8334 5.16664C9.87804 5.09264 8.94671 5.8333 8.50004 5.8333C8.04671 5.8333 7.23337 5.16664 6.50004 5.16664Z"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_2"
                  d="M8.5 3.16671C8.85362 3.16671 9.19276 3.02623 9.44281 2.77618C9.69286 2.52613 9.83333 2.187 9.83333 1.83337C9.47971 1.83337 9.14057 1.97385 8.89052 2.2239C8.64048 2.47395 8.5 2.81309 8.5 3.16671Z"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          ),
          label: "Get on Appstore",
        };
      case "google":
        return {
          href: "https://play.google.com/apps/testing/com.neurofusion.fusion",
          icon: (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="&#240;&#159;&#166;&#134; icon &#34;brand android&#34;">
                <path
                  id="Vector"
                  d="M3.16663 7.16669V11.1667"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_2"
                  d="M13.8334 7.16669V11.1667"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_3"
                  d="M5.16663 6.50002H11.8333M5.16663 6.50002V11.8334C5.16663 12.0102 5.23686 12.1797 5.36189 12.3048C5.48691 12.4298 5.65648 12.5 5.83329 12.5H11.1666C11.3434 12.5 11.513 12.4298 11.638 12.3048C11.7631 12.1797 11.8333 12.0102 11.8333 11.8334V6.50002M5.16663 6.50002C5.16663 5.61597 5.51782 4.76812 6.14294 4.143C6.76806 3.51788 7.6159 3.16669 8.49996 3.16669C9.38401 3.16669 10.2319 3.51788 10.857 4.143C11.4821 4.76812 11.8333 5.61597 11.8333 6.50002"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_4"
                  d="M5.83337 2.5L6.50004 3.83333"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_5"
                  d="M11.1667 2.5L10.5 3.83333"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_6"
                  d="M6.5 12.5V14.5"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_7"
                  d="M10.5 12.5V14.5"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          ),
          label: "Get on Playstore",
        };
    }
  }

  const { href, icon, label } = getStoreInfo(store);
  return (
    <Link
      className={cn(
        mobileLinkStyles({
          variant,
          className,
        }),
        className
      )}
      {...props}
      href={href}
      target="_blank"
    >
      {icon}
      {label}
    </Link>
  );
};
