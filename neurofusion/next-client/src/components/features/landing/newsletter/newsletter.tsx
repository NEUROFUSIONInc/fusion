import { useTheme } from "next-themes";
import React, { useEffect } from "react";

import { newsletterFeatures } from "./data";

export const Newsletter = () => {
  const { resolvedTheme, forcedTheme } = useTheme();
  const isLight = forcedTheme ? forcedTheme === "light" : resolvedTheme === "light";

  useEffect(() => {
    window.CustomSubstackWidget = {
      substackUrl: "neurofusion.substack.com",
      placeholder: "example@gmail.com",
      buttonText: "Subscribe",
      theme: "custom",
      colors: {
        primary: "#644AC2",
        input: "#01122700",
        email: isLight ? "#011227" : "#FFFFFF",
        text: "#FFFFFF",
      },
    };

    const script = document.createElement("script");
    script.src = "https://substackapi.com/widget.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isLight]);

  return (
    <div>
      <div className="container mx-auto mt-20 mb-32 grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-2">
        <div className="mb-8py-8 px-6 text-center md:text-left">
          <h2 className="text-4xl font-bold">Subscribe to our newsletter.</h2>
          <p className="my-8 max-w-xl">Get monthly updates from the team, on features, experiments and more.</p>
          <div className="flex justify-center md:justify-start">
            <div id="custom-substack-embed" />
          </div>
        </div>
        <dl className="hidden grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid lg:pt-2">
          {newsletterFeatures.map((feature) => (
            <div className="flex flex-col items-start" key={feature.title}>
              <div className="rounded-md bg-gray-100 p-2 ring-1 ring-white/10 dark:bg-white/5">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <dt className="mt-4 font-semibold">{feature.title}</dt>
              <dd className="mt-2 max-w-xl leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
