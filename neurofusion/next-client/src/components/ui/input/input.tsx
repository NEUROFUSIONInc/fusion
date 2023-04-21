import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

const styles = cva(
  "text-left font-medium dark:font-normal box-border rounded-md text-md text-primary-900 border dark:bg-transparent dark:border-secondary-400 dark:text-white dark:border-opacity-50 dark:focus:ring-secondary-700 dark:focus:border-opacity-100 border-gray-200 block focus:ring-dark focus:border-primary-900 focus:border-[1.5px] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:border-gray-600 dark:disabled:placeholder:text-gray-300 disabled:placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "text-sm leading-8 h-8 px-3",
        md: "text-md leading-10 h-9 px-3.5",
        lg: "text-md leading-12 h-11 px-4",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof styles> & {
    label?: string;
    helperText?: ReactNode;
    error?: string;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(function input(
  { label, helperText, size = "md", fullWidth, required, error, disabled, id, className, ...props },
  ref
) {
  return (
    <div className="w-full flex-col space-y-1.5 tracking-wide text-primary-900 dark:text-white">
      <label htmlFor={id} className="md:text-md block pl-1 text-sm font-semibold">
        {label && (
          <p className="mb-1">
            {label} {required && <span className="align-middle text-red-500">*</span>}
          </p>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          autoComplete=""
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby="errMsg"
          className={styles({ size, fullWidth, className })}
          {...props}
        />
        {error && (
          <p id="errMsg" className="mt-0.5 text-sm font-normal text-red-500">
            {error}
          </p>
        )}
      </label>
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
});
