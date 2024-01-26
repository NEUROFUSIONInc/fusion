import { VariantProps, cva } from "class-variance-authority";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, FC } from "react";

import { cn } from "~/utils";

const customLinkStyles = cva(
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

interface CustomLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Omit<LinkProps, "href">,
    VariantProps<typeof customLinkStyles> {
  store?: "apple" | "google" | "github" | "discord";
}

export const CustomLink: FC<CustomLinkProps> = ({ variant, store = "apple", className, ...props }) => {
  const strokeColor = variant === "filled" ? "white" : "currentColor";
  function getStoreInfo(store: "apple" | "google" | "github" | "discord") {
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
          href: "https://play.google.com/store/apps/details?id=com.neurofusion.fusion&pli=1",
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
      case "github":
        return {
          href: "https://github.com/neurofusioninc",
          icon: (
            <svg width="20" height="20" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fill={strokeColor}
              />
            </svg>
          ),
          label: "View Github Repos",
        };
      case "discord":
        return {
          href: "https://discord.gg/hzt6cAtwGE",
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 256 293"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
            >
              <path
                d="M226.011 0H29.99C13.459 0 0 13.458 0 30.135v197.778c0 16.677 13.458 30.135 29.989 30.135h165.888l-7.754-27.063 18.725 17.408 17.7 16.384L256 292.571V30.135C256 13.458 242.542 0 226.011 0zm-56.466 191.05s-5.266-6.291-9.655-11.85c19.164-5.413 26.478-17.408 26.478-17.408-5.998 3.95-11.703 6.73-16.823 8.63-7.314 3.073-14.336 5.12-21.211 6.291-14.044 2.633-26.917 1.902-37.888-.146-8.339-1.61-15.507-3.95-21.504-6.29-3.365-1.317-7.022-2.926-10.68-4.974-.438-.293-.877-.439-1.316-.732-.292-.146-.439-.292-.585-.438-2.633-1.463-4.096-2.487-4.096-2.487s7.022 11.703 25.6 17.261c-4.388 5.56-9.801 12.142-9.801 12.142-32.33-1.024-44.617-22.235-44.617-22.235 0-47.104 21.065-85.285 21.065-85.285 21.065-15.799 41.106-15.36 41.106-15.36l1.463 1.756C80.75 77.53 68.608 89.088 68.608 89.088s3.218-1.755 8.63-4.242c15.653-6.876 28.088-8.777 33.208-9.216.877-.147 1.609-.293 2.487-.293a123.776 123.776 0 0 1 29.55-.292c13.896 1.609 28.818 5.705 44.031 14.043 0 0-11.556-10.971-36.425-18.578l2.048-2.34s20.041-.44 41.106 15.36c0 0 21.066 38.18 21.066 85.284 0 0-12.435 21.211-44.764 22.235zm-68.023-68.316c-8.338 0-14.92 7.314-14.92 16.237 0 8.924 6.728 16.238 14.92 16.238 8.339 0 14.921-7.314 14.921-16.238.147-8.923-6.582-16.237-14.92-16.237m53.394 0c-8.339 0-14.922 7.314-14.922 16.237 0 8.924 6.73 16.238 14.922 16.238 8.338 0 14.92-7.314 14.92-16.238 0-8.923-6.582-16.237-14.92-16.237"
                fill={strokeColor}
              />
            </svg>
          ),
          label: "Join our Discord",
        };
    }
  }

  const { href, icon, label } = getStoreInfo(store);
  return (
    <Link
      className={cn(
        customLinkStyles({
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
