import { IntegrationsCarousel } from "./carousel";

export const IntegrationsSection = () => {
  const integrations = ["Fusion", "Neurosity", "Spotify", "ActivityWatch", "Magicflow"];
  return (
    <section
      aria-labelledby="integrations"
      className="relative mb-32 mt-28 flex flex-col items-center space-y-4 text-center md:mb-48"
    >
      <h2 className="mx-4 max-w-2xl text-4xl font-semibold md:text-5xl lg:text-6xl">
        Connect your data to Fusion <span className="text-primary-gradient">seamlessly</span>
      </h2>
      <p className="block max-w-xs text-lg text-gray-600 md:text-xl">
        Fusion seamlessly integrates with applications you already use!
      </p>

      <IntegrationsCarousel integrations={integrations} />
    </section>
  );
};
