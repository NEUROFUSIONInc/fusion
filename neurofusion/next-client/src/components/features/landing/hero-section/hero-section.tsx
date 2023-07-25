import Typist from "react-typist-component";

import { MobileStoreLink } from "~/components/ui";

export const HeroSection = () => {
  return (
    <section
      title="hero-section"
      className="container mx-auto my-8 flex flex-col items-center justify-stretch space-y-16 p-8 md:my-16"
    >
      <div className="flex w-full max-w-2xl flex-col space-y-10 text-center md:min-w-[300px]">
        <h1 className="font-body text-3xl font-semibold sm:text-6xl">
          Unleash the power of integrated{" "}
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
              self-care
              <Typist.Delay ms={2000} />
              <Typist.Backspace count={10} />
            </Typist>
          </span>{" "}
          with Fusion
        </h1>
        <p className="block text-base leading-8 text-gray-500 dark:text-gray-400 md:text-xl">
          Transform your well-being with Neurofusion. Seamlessly integrate behavior, health, and brain data for
          effortless analysis, empowering personalized care on mobile devices.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
          <MobileStoreLink store="apple" className="w-full md:w-auto" />
          <MobileStoreLink store="google" className="w-full md:w-auto" />
        </div>
      </div>
      <div className="relative pb-[56.25%] h-0 w-full">
        <iframe
          title="Neurofusion Demo Video"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          src="https://www.loom.com/embed/7740a180fca446429a8bd6e69b2dc31c?sid=e16cd68d-bf3c-4145-8e3c-97f14a74b3f2?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=0"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-3xl"
        />
      </div>
    </section>
  );
};
