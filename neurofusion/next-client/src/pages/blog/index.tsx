import { MainLayout } from "~/components/layouts";
import BlogCard from "~/components/ui/card/blog-card";

import { getAllPostsWithFrontMatter } from "~/utils/blog";

export async function getStaticProps() {
  const posts = await getAllPostsWithFrontMatter();

  return {
    props: {
      posts,
      title: "NeuroFusion Blog",
      description: "Updates on our products & research.",
    },
  };
}

function Blog({ posts }: any) {
  const containerStyles = {
    maxWidth: "65ch", // Adjust the max-width according to your needs
    margin: "48px auto",
    overflow: "hidden",
  };

  return (
    <MainLayout>
      <div style={containerStyles}>
        <BlogCard posts={posts} />
      </div>
    </MainLayout>
  );
}

(Blog as any).theme = "light";

export default Blog;
