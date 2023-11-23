// import fs from "fs";
// import matter from "gray-matter";
// import Image from "next/image";
import Link from "next/link";
import { MainLayout } from "~/components/layouts";

import { getAllPostsWithFrontMatter } from "~/utils/blog";

export async function getStaticProps() {
  const posts = await getAllPostsWithFrontMatter();
  console.log(posts);

  return {
    props: {
      posts,
      title: "Blog",
      description: "Posts on software engineering",
    },
  };
}

function Blog({ posts }) {
  return (
    // <div className="grid grid-cols-1 mt-8 md:grid-cols-3 lg-grid-cols-4 md:p-0">
    <MainLayout>
      <h1>Hello world</h1>

      {/* {posts.map(({ frontMatter, slug }: any) => {
        console.log(frontMatter);
        return <p>{frontMatter.title}</p>;
      })} */}

      <div className="grid grid-cols-1 mt-8 md:grid-cols-3 lg-grid-cols-4 md:p-0">
        {posts.map(({ frontMatter, slug }: any) => (
          <div key={slug} className="m-2 ">
            <Link href={`/blogs/${slug}`}>
              <p>{frontMatter.title}</p>
            </Link>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default Blog;
