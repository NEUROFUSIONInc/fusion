import { MainLayout, Meta } from "~/components/layouts";
import BlogCard from "~/components/ui/card/blog-card";

import { getAllPostsWithFrontMatter } from "~/utils/blog";

export async function getStaticProps() {
  const posts = await getAllPostsWithFrontMatter();

  return {
    props: {
      posts,
      title: "Blog | NeuroFusion",
      description: "Updates on our products & research.",
    },
  };
}

function Blog({ posts }: any) {
  const containerStyles = {
    maxWidth: "82rem", // Adjust the max-width according to your needs
    margin: "48px auto",
    overflow: "hidden",
  };

  return (
    <MainLayout>
      <Meta
        meta={{
          title: "NeuroFusion Blog",
        }}
      />
      <div style={containerStyles}>
        <div className="blog-heading px-12 pt-24 pb-12">
          <h1 className="text-5xl md:text-5xl lg:text-6xl mb-6 p-2.5 font-semibold">Latest Updates</h1>
        </div>
        <BlogCard posts={posts} />
      </div>
    </MainLayout>
  );
}

(Blog as any).theme = "light";

export default Blog;
