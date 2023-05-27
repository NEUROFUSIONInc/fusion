import type { NextPage } from "next";
import { use, useEffect } from "react";

// import { FeatureSection, HeroSection, IntegrationsSection, Newsletter } from "~/components/features/landing";
import { MainLayout } from "~/components/layouts";

const About: NextPage = () => {
  useEffect(() => {
    window.location.href = "https://rainy-oak-138.notion.site/NEUROFUSION-Team-39887d6b988c4c83ae2a16ae8db44a45";
  }, []);

  return <MainLayout></MainLayout>;
};

(About as any).theme = "dark";

export default About;
