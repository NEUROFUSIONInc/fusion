import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { FC, ButtonHTMLAttributes, ReactNode } from "react";

export const buttonStyles = cva(
  "inline-flex items-center justify-center text-sm gap-1 hover:opacity-95 dark:hover:opacity-90 font-semibold relative rounded-md transition-colors focus:outline-none disabled:opacity-60 focus:ring-2  disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-secondary-600 text-white focus:ring-secondary-100 focus:ring-offset-2",
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
        true: "opacity-50 cursor-wait",
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
  };

export const Button: FC<ButtonProps> = ({
  children,
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
    <button
      type="button"
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
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
