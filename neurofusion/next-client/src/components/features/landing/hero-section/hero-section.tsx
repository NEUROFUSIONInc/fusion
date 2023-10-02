import Typist from "react-typist-component";

import { ButtonLink, MobileStoreLink } from "~/components/ui";
import { useSearchParams } from "next/navigation";

export const HeroSection = () => {
  const searchParams = useSearchParams();
  return (
    <section
      title="hero-section"
      className="container mx-auto my-8 flex flex-col items-center justify-stretch space-y-16 p-8 md:my-16"
    >
      <div className="flex w-full max-w-2xl flex-col space-y-10 text-center md:min-w-[300px]">
        {searchParams.get("persona") != "explorers_researchers" && (
          <h1 className="font-body text-3xl font-semibold sm:text-6xl">
            Manage & Improve your{" "}
            <span className="text-primary-gradient">
              <Typist typingDelay={100} cursor={<span className="cursor">|</span>} loop>
                well-being
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={12} />
                <Typist.Delay ms={500} />
                health
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={7} />
                <Typist.Delay ms={500} />
                productivity
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={10} />
              </Typist>
            </span>{" "}
            with Fusion
          </h1>
        )}
        {searchParams.get("persona") == "explorers_researchers" && (
          <h1 className="font-body text-3xl font-semibold sm:text-6xl">
            Comprehensive platform for{" "}
            <span className="text-primary-gradient">
              <Typist typingDelay={100} cursor={<span className="cursor">|</span>} loop>
                decentralized research
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={22} />
                <Typist.Delay ms={500} />
                behavioral science
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={18} />
                <Typist.Delay ms={500} />
                neurotech exploration
                <Typist.Delay ms={2000} />
                <Typist.Backspace count={21} />
              </Typist>
            </span>{" "}
          </h1>
        )}
        {/* <p className="block text-base leading-8 text-gray-500 dark:text-gray-400 md:text-xl">
          Our copilot brings together your daily activities, fitness, and brain data for a better and healthier life.
        </p> */}

        {searchParams.get("persona") != "explorers_researchers" && (
          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            <MobileStoreLink store="apple" className="w-full md:w-auto" />
            <MobileStoreLink store="google" className="w-full md:w-auto" />
          </div>
        )}
        {searchParams.get("persona") == "explorers_researchers" && (
          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            {/* <MobileStoreLink store="apple" className="w-full md:w-auto" />
            <MobileStoreLink store="google" className="w-full md:w-auto" /> */}
            <ButtonLink
              intent="outlined"
              href="https://usefusion.app/playground"
              size="xl"
              className="mt-4 w-full md:w-11/12"
            >
              Use Fusion Explorer!
            </ButtonLink>
          </div>
        )}
      </div>
      <div className="relative pb-[56.25%] h-0 w-full">
        <iframe
          title="Neurofusion Demo Video"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          src="https://www.loom.com/embed/2893c581a8f44e6389b2f7d5b0f9baec?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=0"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-3xl"
        />
      </div>
    </section>
  );
};
