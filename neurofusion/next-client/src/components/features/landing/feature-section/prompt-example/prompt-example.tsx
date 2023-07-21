import { FC, ReactNode } from "react";
import { cn } from "~/utils";

interface PromptExampleProps {
  title: ReactNode;
  leftSubtitle: string;
  rightSubtitle: string;
  className?: string;
}

export const PromptExample: FC<PromptExampleProps> = ({ title, leftSubtitle, rightSubtitle, className }) => {
  return (
    <div
      className={cn(
        "w-[260px] px-6 py-6 bg-white rounded-bl-lg rounded-br-lg shadow border-t-2 border-indigo-700 flex-col justify-start items-start gap-4 flex",
        className
      )}
    >
      <div className="text-base font-normal leading-normal">{title}</div>
      <div className="justify-start text-gray-500 items-center gap-[9px] inline-flex">
        <p className=" text-sm font-normal leading-normal">{leftSubtitle}</p>
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
        <p className="text-sm font-normal leading-normal">{rightSubtitle}</p>
      </div>
    </div>
  );
};
