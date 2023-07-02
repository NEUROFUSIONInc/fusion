import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { ReactNode, forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import colors from "~/theme/colors";

const inputStyles = cva(
  "rounded-md w-auto text-white font-sans bg-transparent border h-[52] border-light focus:border-white disabled:bg-gray-100 disabled:opacity-50 ",
  {
    variants: {
      size: {
        sm: "text-base leading-[18px] px-3",
        md: "text-lg leading-[22px] px-3",
        lg: "text-lg leading-[24px] px-4",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export type InputProps = TextInputProps &
  VariantProps<typeof inputStyles> & {
    disabled?: boolean;
    label?: string;
    helperText?: ReactNode;
    error?: string;
  };

export const Input = forwardRef<TextInput, InputProps>(function input(
  {
    label,
    helperText,
    fullWidth,
    error,
    editable = true,
    size,
    className,
    ...props
  },
  ref
) {
  const value = props.value;

  return (
    <View>
      {label && (
        <Text className="font-sans text-base text-white mb-3 mt-3">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        editable={editable}
        aria-disabled={editable}
        aria-invalid={Boolean(error)}
        aria-describedby="errMsg"
        placeholderTextColor={colors.light}
        selectionColor={colors.blue[400]}
        value={value}
        className={`${inputStyles({ size, fullWidth, className })} ${
          value && value?.length > 30 ? "h-[64] pb-4" : ""
        }`}
        {...props}
      />
      {error && (
        <Text
          id="errMsg"
          className="font-sans mt-0.5 text-sm font-normal text-red-400"
        >
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="font-sans text-sm text-gray-400">{helperText}</Text>
      )}
    </View>
  );
});
