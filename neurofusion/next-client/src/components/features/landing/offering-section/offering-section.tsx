import Image from "next/image";

import { fusionOfferingFeatures } from "./data";

import { MobileStoreLink } from "~/components/ui";

export const OfferingSection = () => {
  return (
    <section title="offering-and-disclaimers-section" className="w-full p-4">
      <div className="relative mb-28 mt-20 flex h-auto w-full max-w-4xl items-stretch justify-around rounded-2xl bg-indigo-300/20 bg-offering-pattern md:mx-auto md:max-h-[468px]">
        <Image
          src="/images/fusion-app-home.svg"
          width={320}
          height={504}
          alt="Fusion App Screenshot"
          className="mt-24 hidden overflow-hidden object-contain md:block"
        />
        <div className="flex flex-col items-start space-y-8 p-8 text-center md:text-left">
          <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">
            <span className="text-primary-gradient">Fusion</span> offers you
          </h2>
          <div className="flex flex-col space-y-4">
            {fusionOfferingFeatures.map((feature) => (
              <dl className="flex max-w-xs flex-col items-center md:flex-row md:items-start" key={feature.title}>
                <div className="mb-4 rounded-md bg-indigo-200 p-3 md:mb-0">
                  <feature.icon className="h-6 w-6 stroke-secondary-600" aria-hidden="true" />
                </div>
                <div className="ml-4 text-base md:text-lg">
                  <dt className="font-semibold">{feature.title}</dt>
                  <dd className="mt-2 max-w-xl leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
                </div>
              </dl>
            ))}
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-x-6 gap-y-2 pt-6 md:flex-row md:pt-0">
            <MobileStoreLink store="apple" className="w-full md:w-auto" />
            <MobileStoreLink store="google" className="w-full md:w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};
