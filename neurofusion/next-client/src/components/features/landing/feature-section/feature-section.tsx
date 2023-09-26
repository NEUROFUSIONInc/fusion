import Image from "next/image";
import { FC } from "react";

import { fusionFeatures } from "./data";
import { FusionFeature } from "./fusion-feature/fusion-feature";
import { PromptExample } from "./prompt-example/prompt-example";
import { ButtonLink, MobileStoreLink } from "~/components/ui";
import { CalendarCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const FeatureSection: FC = () => {
  const searchParams = useSearchParams();

  return (
    <section title="feature-section">
      <div className="container max-w-7xl relative flex flex-col gap-y-12 md:gap-y-32 mx-auto my-12 w-full p-4 lg:my-36">
        {searchParams.get("persona") == null && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
            <div>
              <FusionFeature feature={fusionFeatures[0]} />
              <div className="mt-10 flex flex-col gap-x-6 gap-y-2 md:flex-row w-full px-2">
                <MobileStoreLink store="apple" className="w-full md:w-auto" />
                <MobileStoreLink store="google" className="w-full md:w-auto" />
              </div>
            </div>
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
        )}
        {/* Coaches & Health Professionals */}
        {searchParams.get("persona") == "coaches_health_professionals" && (
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-y-6">
            <div className="relative w-auto h-auto">
              <Image
                src="/images/features/health-and-fitness.png"
                alt="User using fusion app"
                width={607}
                height={605}
                className="rounded-2xl"
              />
              <PromptExample
                title="Kate, please record your blood pressure"
                leftSubtitle="Weekends"
                rightSubtitle="Every 12 hrs"
                className="hidden md:block absolute bottom-4 right-20 lg:right-15 md:transform"
              />
            </div>
            <div>
              <FusionFeature feature={fusionFeatures[1]} />
              <ButtonLink
                intent="filled"
                target="_blank"
                leftIcon={<CalendarCheck className="w-5 h-5 mr-2" />}
                href="https://calendly.com/oreogundipe/chat-about-fusion"
                size="xl"
                className="mt-4"
                fullWidth
              >
                Schedule a call with us
              </ButtonLink>
            </div>
          </div>
        )}
        {/* Researchers & Explorers */}
        {searchParams.get("persona") == "explorers_researchers" && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
            <div>
              <FusionFeature feature={fusionFeatures[2]} />
              <ButtonLink
                intent="filled"
                href="https://usefusion.app/playground"
                size="xl"
                className="mt-4 w-full md:w-11/12"
              >
                Use Fusion Explorer!
              </ButtonLink>
            </div>

            <Image
              src="/images/features/phone_action.png"
              alt="User using fusion app"
              width={609}
              height={914}
              className="rounded-2xl"
            />
          </div>
        )}
      </div>
    </section>
  );
};
