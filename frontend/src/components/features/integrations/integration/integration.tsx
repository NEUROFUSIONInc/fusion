import { ExternalLink, PlugZap } from "lucide-react";
import Image from "next/image";
import { FC } from "react";

import { IIntegration } from "../data";

import { Button } from "~/components/ui";

interface IIntegrationProps {
  integration: IIntegration;
  isConnected?: boolean;
  loading?: boolean;
  onclick?: () => void;
}

export const Integration: FC<IIntegrationProps> = ({ integration, loading, isConnected, onclick }) => {
  return (
    <div className="flex max-w-md cursor-pointer flex-col items-start gap-4 rounded-md border px-8 py-6 shadow-sm transition-transform duration-300 ease-in-out hover:scale-105  dark:border-slate-800 hover:dark:shadow-gray-800">
      <div className="flex w-full justify-between">
        <div>
          <h2 className="text-lg">{integration.title}</h2>
          <a
            href={integration.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            {shortenLink(integration.href)}
            <span className="ml-1.5 inline-flex">
              <ExternalLink size={12} />
            </span>
          </a>
        </div>
        <Image
          src={integration.imageUrl}
          width={100}
          height={100}
          alt={`${integration.title} image`}
          className="max-h-10 object-contain"
        />
      </div>
      <p className="text-[15px] text-slate-700 dark:text-slate-300">{integration.description}</p>
      <Button
        intent={isConnected ? "dark" : "integration"}
        className="ml-auto"
        isLoading={loading}
        disabled={loading}
        leftIcon={<PlugZap className="fill-current" />}
        onClick={onclick}
      >
        {isConnected ? "Connected" : "Connect"}
      </Button>
    </div>
  );
};

const shortenLink = (href: string) => href.replace(/^https?:\/\//i, "");
