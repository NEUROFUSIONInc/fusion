import type { NextPage } from "next";

import {
  FaqSection,
  FeatureSection,
  HeroSection,
  IntegrationsSection,
  OfferingSection,
  TeamSection,
  TestimonialSection,
} from "~/components/features/landing";
import { MainLayout } from "~/components/layouts";

const Home: NextPage = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <IntegrationsSection />
      <TeamSection />
      <TestimonialSection />
      <FaqSection />
      <OfferingSection />
    </MainLayout>
  );
};

(Home as any).theme = "light";

export default Home;
