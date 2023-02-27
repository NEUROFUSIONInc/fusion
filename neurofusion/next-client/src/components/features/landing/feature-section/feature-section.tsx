import { FC } from "react";

import { fusionFeatures } from "./data";

export const FeatureSection: FC = () => {
  return (
    <section>
      <div className="container relative mx-auto mt-12 w-full p-4 lg:mt-20">
        <div className="mx-auto grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {fusionFeatures.map((feature) => (
            <div className="mx-auto max-w-md p-6" key={feature.id}>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-50 p-2 ring-1 ring-white/10 dark:bg-white/5">
                {feature.icon}
              </div>
              <p className="mt-5 text-xl font-medium leading-6">{feature.title}</p>
              <p className="mt-3 text-base font-semibold text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
