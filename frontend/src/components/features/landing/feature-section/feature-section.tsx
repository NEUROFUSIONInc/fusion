import Image from "next/image";
import { FC } from "react";

import { fusionFeatures } from "./data";
import { FusionFeature } from "./fusion-feature/fusion-feature";
import { PromptExample } from "./prompt-example/prompt-example";
import { ButtonLink, CustomLink } from "~/components/ui";
import { MsPartner } from "./ms-partner";

export const FeatureSection = ({ isResearch = false }) => {
  return (
    <section title="feature-section">
      <div className="container max-w-7xl relative flex flex-col gap-y-12 md:gap-y-32 mx-auto my-12 w-full p-4 lg:my-36">
        {isResearch ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
            <div>
              <FusionFeature feature={fusionFeatures[2]} />
              <ButtonLink intent="outlined" href="/recordings" size="xl" className="mt-4 w-full md:w-11/12">
                Use NeuroFusion Explorer!
              </ButtonLink>
            </div>
            <div className="overflow-hidden max-w-full md:max-w-2xl">
              <Image
                src="/images/features/neurofusion_experiment.png"
                alt="User using fusion app"
                width={609}
                height={914}
                className="rounded-2xl"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
              <div>
                <FusionFeature feature={fusionFeatures[0]} />
                <div className="mt-10 flex flex-col gap-x-6 gap-y-2 md:flex-row w-full px-2">
                  <CustomLink store="apple" className="w-full md:w-auto" />
                  <CustomLink store="google" className="w-full md:w-auto" />
                </div>
              </div>
              <div className="relative w-auto h-auto">
                <Image
                  src="/images/features/womanphone2.png"
                  alt="User using fusion app"
                  width={609}
                  height={914}
                  className="rounded-2xl"
                />
                <PromptExample
                  title="What's top of mind for you today?"
                  leftSubtitle="Mo, Tu, We, Th, Fr"
                  rightSubtitle="Once"
                  className="hidden md:block absolute top-4 right-1/2 md:transform md:-translate-x-2 lg:-translate-x-1/2"
                />
              </div>
            </div>
          </>
        )}
        <MsPartner />
      </div>
    </section>
  );
};
