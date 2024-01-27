import { cva, type VariantProps } from "class-variance-authority";
import { FC } from "react";
import { Pressable, Text, TouchableOpacityProps, View } from "react-native";

import { ActivityIndicator } from "../activity-indicator";

const buttonStyles = cva(
  "inline-flex flex-row active:opacity-90 self-start relative disabled:opacity-70 items-center w-auto justify-center min-w-max rounded-md",
  {
    variants: {
      variant: {
        primary: "bg-white",
        secondary: "bg-primary-900",
        outline: "bg-transparent border-2 border-white active:opacity-75",
        "outline-dark": "bg-transparent border-2 border-primary-900",
        ghost: "bg-transparent",
      },
      disabled: {
        true: "opacity-70",
      },
      rounded: {
        true: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
      size: {
        xs: "px-3 py-3 text-xs",
        sm: "px-3 py-2.5 leading-4 text-sm",
        md: "px-5 py-3.5",
        lg: "px-5 py-4",
        icon: "flex justify-center min-h-[30px] min-w-[30px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const buttonTextStyles = cva("font-sans text-base", {
  variants: {
    variant: {
      primary: "text-secondary-900",
      secondary: "text-white",
      outline: "text-white",
      "outline-dark": "text-primary-900",
      ghost: "text-white",
    },
    textColor: {
      white: "text-white",
      black: "text-secondary-900",
    },
    textSize: {
      bold: "font-sans-bold text-[26px]",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonProps = TouchableOpacityProps &
  VariantProps<typeof buttonStyles> & {
    title?: string;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    loading?: boolean;
    textColor?: "white" | "black";
    textSize?: "bold";
  };

export const Button: FC<ButtonProps> = ({
  title,
  variant,
  disabled,
  rounded,
  size,
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  className,
  textColor,
  textSize,
  ...props
}) => (
  <Pressable
    className={buttonStyles({
      variant,
      disabled,
      size,
      rounded,
      fullWidth,
      className,
    })}
    disabled={disabled}
    {...props}
  >
    {loading && <ActivityIndicator size="small" className="mr-2" />}
    {!loading && leftIcon && (
      <View
        className={buttonTextStyles({ variant, textColor, className: "mr-1" })}
      >
        {leftIcon}
      </View>
    )}
    {title && (
      <Text className={buttonTextStyles({ variant, textColor, textSize })}>
        {title}
      </Text>
    )}
    {rightIcon && (
      <View
        className={buttonTextStyles({ variant, textColor, className: "ml-1" })}
      >
        {rightIcon}
      </View>
    )}
  </Pressable>
);
