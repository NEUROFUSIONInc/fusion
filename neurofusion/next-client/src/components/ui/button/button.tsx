import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export const buttonStyles = cva(
  "inline-flex items-center justify-center text-sm gap-1 hover:opacity-95 dark:hover:opacity-90 font-semibold relative rounded-md transition-colors focus:outline-none disabled:opacity-60 focus:ring-2  disabled:cursor-not-allowed min-w-max",
  {
    variants: {
      intent: {
        primary: "bg-secondary-600 text-white focus:ring-secondary-100 focus:ring-offset-2",
        ghost:
          "bg-transparent focus:outline-0 border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-dark focus-visible:ring-2 dark:focus-visible:ring-secondary-100 focus:ring-transparent focus:outline-none hover:opacity-90",
        integration:
          "bg-white shadow-sm border dark:border-slate-800 text-dark dark:bg-gray-700 dark:text-white focus:ring-dark focus:ring-offset-0 dark:focus:ring-secondary-100",
        dark: "bg-slate-900 text-white focus-visible:ring-dark focus:ring-0  focus-visible:ring-offset-2 dark:focus-visible:ring-secondary-100 dark:bg-gray-50 dark:text-primary-800",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        true: "rounded-full",
      },
      size: {
        xs: "px-3 py-2 text-xs",
        sm: "px-3 py-1.5 leading-4 text-sm" /** For backwards compatibility */,
        md: "h-9 px-5 py-2",
        lg: "h-10 px-5 py-2.5",
        icon: "flex justify-center min-h-[30px] min-w-[30px]",
      },
      isLoading: {
        true: "opacity-80 cursor-wait",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loadingText?: string;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function button(
  {
    children,
    isLoading = false,
    intent = "primary",
    size = "md",
    fullWidth,
    leftIcon,
    rightIcon,
    rounded,
    className,
    loadingText = "Loading...",
    ...props
  },
  ref
) {
  return (
    <button
      type="button"
      ref={ref}
      className={buttonStyles({
        fullWidth,
        intent,
        size,
        isLoading,
        rounded,
        className,
      })}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={14} className="animate-spin" /> <span>{loadingText}</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});
