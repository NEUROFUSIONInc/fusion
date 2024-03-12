import type { NextPage } from "next";

import {
  FeatureSection,
  IntegrationsSection,
  TeamSection,
  TestimonialSection,
  FaqSection,
  OfferingSection,
} from "~/components/features/landing";
import { MainLayout, Meta } from "~/components/layouts";

import dynamic from "next/dynamic";
const HeroSection = dynamic(() => import("~/components/features/landing").then((mod) => mod.HeroSection));

const Home: NextPage = () => {
  return (
    <MainLayout>
      <Meta />
      <HeroSection />
      <FeatureSection />
      <IntegrationsSection />
      <OfferingSection />
      <TestimonialSection />
      <TeamSection />
      <FaqSection />
    </MainLayout>
  );
};

(Home as any).theme = "light";

export default Home;
