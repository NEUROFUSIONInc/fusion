import { useTheme } from "next-themes";
import { useEffect } from "react";

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
        primary: "#3715D7",
        input: isLight ? "#FFFFFF" : "#01122700",
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
    <div className="mb-8 px-6 text-center">
      <h2 className="text-2xl font-medium md:text-4xl">Subscribe to our newsletter</h2>
      <p className="my-4 max-w-xl text-[15px] md:text-base">
        Get monthly updates from the team, on features, experiments and more.
      </p>
      <div className="my-8 flex justify-center">
        <div id="custom-substack-embed" />
      </div>
    </div>
  );
};
