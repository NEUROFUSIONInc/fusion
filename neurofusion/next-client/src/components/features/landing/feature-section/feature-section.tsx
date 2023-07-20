import Image from "next/image";
import { FC } from "react";

import { fusionFeatures } from "./data";
import { FusionFeature } from "./fusion-feature/fusion-feature";
import { PromptExample } from "./prompt-example/prompt-example";

export const FeatureSection: FC = () => {
  return (
    <section>
      <div className="container max-w-7xl relative flex flex-col gap-y-12 md:gap-y-32 mx-auto my-12 w-full p-4 lg:my-36">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-6">
          <FusionFeature feature={fusionFeatures[0]} />
          <div className="relative w-auto h-auto">
            <Image
              src="/images/features/iphone-mockup.png"
              alt="User using fusion app"
              width={609}
              height={914}
              className="rounded-2xl"
            />
            <PromptExample
              title="Have you taken a 5 minute walk?"
              leftSubtitle="Mo, Tu, We, Th, Fr"
              rightSubtitle="Every 5 hrs"
              className="hidden md:block absolute top-4 right-1/2 md:transform md:-translate-x-2 lg:-translate-x-1/2"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-y-6">
          <div className="relative w-auto h-auto">
            <Image
              src="/images/features/health-and-fitness.png"
              alt="User using fusion app"
              width={607}
              height={605}
              className="rounded-2xl"
            />
            <PromptExample
              title="Have you taken a 5 minute walk?"
              leftSubtitle="Mo, Tu, We, Th, Fr"
              rightSubtitle="Every 5 hrs"
              className="hidden md:block absolute bottom-4 right-20 lg:right-15 md:transform"
            />
          </div>
          <FusionFeature feature={fusionFeatures[1]} />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-6">
          <FusionFeature feature={fusionFeatures[2]} />
          <Image
            src="/images/features/iphone-mockup.png"
            alt="User using fusion app"
            width={609}
            height={914}
            className="rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};
