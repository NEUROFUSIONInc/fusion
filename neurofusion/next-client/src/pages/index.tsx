import type { NextPage } from "next";

import { FeatureSection, HeroSection, IntegrationsSection, Newsletter } from "~/components/features/landing";
import { MainLayout } from "~/components/layouts";

const Home: NextPage = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <IntegrationsSection />
      <Newsletter />
    </MainLayout>
  );
};

(Home as any).theme = "dark";

export default Home;
