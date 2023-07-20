import Image from "next/image";
import Typist from "react-typist-component";

import { MobileStoreLink } from "~/components/ui";

export const HeroSection = () => {
  return (
    <section className="container mx-auto my-8 flex flex-col items-center justify-stretch space-y-16 p-8 md:my-16">
      <div className=" flex w-full max-w-2xl flex-col space-y-10 text-center md:min-w-[300px]">
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
          Transform your well-being with Neurofusion. Seamlessly integrate behaviour, health, and brain data for
          effortless analysis, empowering personalized care on mobile devices.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-2 md:flex-row">
          <MobileStoreLink store="apple" className="w-full md:w-auto" />
          <MobileStoreLink store="google" className="w-full md:w-auto" />
        </div>
      </div>
      <Image
        loading="eager"
        src="/images/placeholder.jpg"
        width={1200}
        height={700}
        alt="Fusion App Screenshot"
        className="mx-auto h-80 w-full max-w-7xl overflow-hidden rounded-3xl object-cover md:h-auto md:w-11/12"
      />
    </section>
  );
};
