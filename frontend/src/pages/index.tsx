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
import { MainLayout, Meta } from "~/components/layouts";

import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("~/components/features/landing").then((mod) => mod.HeroSection));

export async function getStaticProps() {
  const posts = await getAllPostsWithFrontMatter();

  return {
    props: {
      posts: posts.slice(0, 3), // Slice the array to get only the first 3 posts
    },
  };
}
const Home: NextPage = ({ posts }: any) => {
  return (
    <MainLayout>
      <Meta />
      <HeroSection />
      <FeatureSection />
      <IntegrationsSection />
      <OfferingSection />
      <BlogSection posts={posts} />
      <TestimonialSection />
      <TeamSection />
      <FaqSection />
    </MainLayout>
  );
};

(Home as any).theme = "light";

export default Home;
