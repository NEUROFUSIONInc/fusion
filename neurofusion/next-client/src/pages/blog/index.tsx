import { MainLayout } from "~/components/layouts";
import BlogCard from "~/components/ui/card/blog-card";

import { getAllPostsWithFrontMatter } from "~/utils/blog";

export async function getStaticProps() {
  const posts = await getAllPostsWithFrontMatter();

  return {
    props: {
      posts,
      title: "Blog",
      description: "Posts on software engineering",
    },
  };
}

function Blog({ posts }: any) {
  const containerStyles = {
    maxWidth: "65ch", // Adjust the max-width according to your needs
    margin: "48px auto",
    overflow: "hidden",
    // backgroundColor: "white",
    // borderRadius: "0.375rem", // Adjust the border-radius according to your needs
    // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
