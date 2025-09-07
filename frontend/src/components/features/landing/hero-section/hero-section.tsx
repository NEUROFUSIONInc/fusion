import { ButtonLink, CustomLink } from "~/components/ui";
import { appInsights } from "~/utils/appInsights";

export const HeroSection = ({ isResearch = false }) => {
  const handleClick = () => {
    appInsights.trackEvent({ name: "use_neurofusion_explorer" });
  };

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
          <p className="block text-base leading-8 text-gray-500 dark:text-gray-400 md:text-xl">
            Use NeuroFusion Explorer to remotely collect and analyze EEG data from your cognitive and behavioral
            studies.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            <ButtonLink
              onClick={handleClick}
              intent="outlined"
              href="/recordings"
              size="xl"
              className="mt-4 w-full md:w-11/12"
            >
              Use NeuroFusion Explorer!
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col space-y-10 text-center md:min-w-[300px]">
            <h1 className="font-body text-1xl font-semibold sm:text-6xl">
              Explore Your Mind. <br />
              <span className="text-primary-gradient">
                Learn Your Brain’s Patterns. <br />
                Advance Discovery Together!
              </span>
            </h1>
            <p className="block text-base leading-8 text-gray-500 dark:text-gray-400 md:text-xl">
              Fusion Copilot helps you to understand your brain’s state, supporting better neurological health and
              well-being.
              <br />
              Effortlessly collect and explore EEG data to gain insights that help you make informed choices for a
              healthier mind.
            </p>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
            <CustomLink store="apple" className="w-full md:w-auto" />
            <CustomLink store="google" className="w-full md:w-auto" />
          </div>
          <div className="relative pb-[56.25%] h-0 w-full">
            <iframe
              title="How to use Fusion Copilot App"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              src="https://www.loom.com/embed/013db5f1fb3f44f49693ab59cb3e36f4?sid=ae15a47c-8d9d-4529-9ca2-13ec6e19e1ad?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=0"
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
