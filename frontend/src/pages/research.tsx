import type { NextPage } from "next";

import {
  FeatureSection,
  IntegrationsSection,
  TeamSection,
  TestimonialSection,
  FaqSection,
  OfferingSection,
} from "~/components/features/landing";
import { MainLayout, Meta, metaDefaults } from "~/components/layouts";

import dynamic from "next/dynamic";
const HeroSection = dynamic(() => import("~/components/features/landing").then((mod) => mod.HeroSection));

const Research: NextPage = () => {
  return (
    <MainLayout isResearch>
      <Meta
        meta={{
          title: "NeuroFusion - The simplest way to do brain and behavior research",
          description:
            "Use NeuroFusion to do run cognitive experiments, collect brain data remotely, and analyze results.",
          image: `${metaDefaults.baseUrl}/images/features/neurofusion_experiment.png`,
        }}
      />
      <HeroSection isResearch />
      <FeatureSection isResearch />
      <IntegrationsSection />
      <OfferingSection />
      <TestimonialSection isResearch />
      <TeamSection />
      <FaqSection isResearch />
    </MainLayout>
  );
};

(Research as any).theme = "light";

export default Research;
