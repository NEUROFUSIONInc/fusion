import { FC, HTMLAttributes } from "react";

interface IButtonProps extends HTMLAttributes<HTMLButtonElement> {}

export const Button: FC<IButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="py-1 px-4 bg-gray-900 text-zinc-50 rounded-md"
      {...props}
    >
      {children}
    </button>
  );
};
