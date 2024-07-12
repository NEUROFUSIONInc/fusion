import BlogCard from "~/components/ui/card/blog-card";
import { getAllPostsWithFrontMatter } from "~/utils/blog";

export function BlogSection({ posts }: any) {
  const containerStyles = {
    maxWidth: "82rem", // Adjust the max-width according to your needs
    margin: "48px auto",
    overflow: "hidden",
  };
  const cardStyles = {
    "&:hover": {
      transform: "none",
    },
  };

  return (
    <section title="News and Updates" aria-labelledby="" className="font-body mb-24">
      <div style={containerStyles}>
        <div className="blog-heading px-12 pt-12">
          <h1 className="font-body font-semibold text-5xl md:text-5xl lg:text-6xl mb-6 py-2.5">News and Updates</h1>
        </div>
        <BlogCard posts={posts} cardStyles={cardStyles} />
      </div>
    </section>
  );
}
