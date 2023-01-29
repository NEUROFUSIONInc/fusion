import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button type="button" className="text-zinc-50 rounded-full bg-secondary-600 py-1 px-4 text-sm font-bold" {...props}>
      {children}
    </button>
  );
};
