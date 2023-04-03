import { useTheme } from "next-themes";
import Image from "next/image";
import React from "react";

import { ButtonLink } from "~/components/ui";

export const IntegrationsSection = () => {
  const { resolvedTheme, forcedTheme } = useTheme();
  const isLight = forcedTheme ? forcedTheme === "light" : resolvedTheme === "light";

  return (
    <section aria-labelledby="relative integrations">
      <div className="w-xl container mx-auto my-12 items-center px-8  py-8 lg:py-16">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="order-last mt-8 grid grid-cols-2 gap-0.5 lg:order-none lg:mt-0 lg:grid-cols-2">
            <div className="bg-gray-5 col-span-1 flex justify-center px-4 py-8 md:justify-start lg:justify-center">
              <Image
                width={60}
                height={60}
                className="h-14 w-14 object-cover lg:h-20 lg:w-20"
                src={
                  isLight
                    ? "/images/integrations/spotify_icon_black.png"
                    : "/images/integrations/spotify_icon_green.png"
                }
                alt="logo"
              />
            </div>
            <div className="bg-gray-5 col-span-1 flex justify-center px-4 py-8 md:justify-start lg:justify-center">
              <Image
                width={60}
                height={60}
                className="h-14 w-14 object-cover lg:h-20 lg:w-20"
                src={
                  isLight ? "/images/integrations/vital_icon_light.png" : "/images/integrations/vital_icon_black.jpeg"
                }
                alt="logo"
              />
            </div>
            <div className="bg-gray-5 col-span-1 flex justify-center px-4 py-8 md:justify-start lg:justify-center">
              <Image
                width={60}
                height={60}
                className="h-14 w-14 object-cover lg:h-20 lg:w-20"
                src="/images/integrations/neurosity_icon_light.png"
                alt="logo"
              />
            </div>
            <div className="bg-gray-5 col-span-1 flex justify-center px-4 py-8 md:justify-start lg:justify-center">
              <Image
                width={200}
                height={40}
                className="object-contain"
                src="/images/integrations/magicflow_icon.webp"
                alt="logo"
              />
            </div>
          </div>
          <div>
            <div className="max-w-2xl lg:p-10">
              <div className="text-center md:text-left">
                <p className="text-5xl">Connect your data</p>
                <p className="my-8 text-lg tracking-tight text-gray-600 dark:text-gray-400">
                  Fusion integrates with applications you already use daily!
                </p>
                <ButtonLink href="/auth/login" size="lg" rounded>
                  Start linking integrations
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
