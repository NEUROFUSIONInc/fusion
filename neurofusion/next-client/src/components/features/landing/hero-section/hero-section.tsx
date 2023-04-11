import Image from "next/image";

import { ButtonLink } from "~/components/ui";

export const HeroSection = () => {
  return (
    <section className="container mx-auto my-16 flex flex-wrap items-center justify-between p-8 lg:flex-nowrap">
      <div className=" w-full max-w-xl text-center md:min-w-[300px] md:text-left">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Harness your data, augment your life
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 md:text-xl">
          Bringing together data on sleep, health vitals, screen time, and behaviour to provide insights into how they impact your lifestyle
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6 md:justify-start">
          <ButtonLink href="https://forms.gle/wNx97ePfN5WdKbrq5" size="lg" rounded>
            Get started
          </ButtonLink>
          <ButtonLink href="https://neurofusion.substack.com" size="lg" intent="ghost">
            Learn more <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </div>
      <Image
        loading="eager"
        src="/images/prompt.png"
        width={700}
        height={500}
        alt="Fusion App Screenshot"
        className="ml-0 mt-12 overflow-hidden p-1 md:ml-6 lg:mt-0"
      />
    </section>
  );
};
