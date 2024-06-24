import type { NextPage } from "next";
import { getAllPostsWithFrontMatter } from "~/utils/blog";

import {
  FeatureSection,
  IntegrationsSection,
  TeamSection,
  TestimonialSection,
  FaqSection,
  OfferingSection,
  BlogSection,
} from "~/components/features/landing";
import { MainLayout, Meta, metaDefaults } from "~/components/layouts";

import dynamic from "next/dynamic";
const HeroSection = dynamic(() => import("~/components/features/landing").then((mod) => mod.HeroSection));

export async function getStaticProps() {
  const posts: any[] = (await getAllPostsWithFrontMatter()) as unknown as any[];

  const selectedSlugs = ["cold-plunge-impact", "making-health-behavior-data-accessible", "going-fulltime"];
  const filteredPosts = posts.filter((post: any) => selectedSlugs.includes(post.slug));

  return {
    props: {
      posts: filteredPosts,
    },
  };
}

const Research: NextPage = ({posts}: any) => {
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
      <OfferingSection isResearch />
      <TestimonialSection isResearch />
      <TeamSection />
      <BlogSection posts={posts} />
      <FaqSection isResearch />
    </MainLayout>
  );
};

(Research as any).theme = "light";

export default Research;
