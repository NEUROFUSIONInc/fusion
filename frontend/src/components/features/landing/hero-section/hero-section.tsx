import Typist from "react-typist-component";

import { ButtonLink, MobileStoreLink } from "~/components/ui";
import { useSearchParams } from "next/navigation";

export const HeroSection = ({ isResearch = false }) => {
  return (
    <section
      title="hero-section"
      className="container mx-auto my-8 flex flex-col items-center justify-stretch space-y-16 p-8 md:my-16"
    >
      {isResearch ? (
        <div className="flex w-full max-w-2xl flex-col space-y-10 text-center md:min-w-[300px]">
          <h1 className="font-body text-3xl font-semibold sm:text-6xl">
            The simplest way to do brain and behavior <span className="text-primary-gradient">research at scale</span>{" "}
          </h1>

          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            <ButtonLink intent="outlined" href="/playground" size="xl" className="mt-4 w-full md:w-11/12">
              Use NeuroFusion Explorer!
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full max-w-2xl flex-col space-y-10 text-center md:min-w-[300px]">
            <h1 className="font-body text-3xl font-semibold sm:text-6xl">
              Personal Insights from Your <span className="text-primary-gradient">Daily Habits and Actions</span>
            </h1>
            <p className="block text-base leading-8 text-gray-500 dark:text-gray-400 md:text-xl">
              Use Fusion to understand changes in your behavior and improve your quality of life.
            </p>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            <MobileStoreLink store="apple" className="w-full md:w-auto" />
            <MobileStoreLink store="google" className="w-full md:w-auto" />
          </div>
          <div className="relative pb-[56.25%] h-0 w-full">
            <iframe
              title="Neurofusion Demo Video"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              src="https://www.loom.com/embed/dac59af6c00442c995f0235bccefc481?sid=8444f557-a841-4d0a-9682-455a6cc7b827?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=0"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-3xl"
            />
            <div></div>
          </div>
        </>
      )}
    </section>
  );
};
