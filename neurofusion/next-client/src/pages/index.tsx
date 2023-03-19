import type { NextPage } from "next";

import { MainLayout } from "~/components/layouts";
import { FeatureSection, HeroSection, IntegrationsSection, Newsletter } from "~/components/features/landing";

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
