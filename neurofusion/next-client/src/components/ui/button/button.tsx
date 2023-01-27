import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      type="button"
      className="py-1 px-4 bg-gray-900 text-zinc-50 rounded-md"
      {...props}
    >
      {children}
    </button>
  );
};
