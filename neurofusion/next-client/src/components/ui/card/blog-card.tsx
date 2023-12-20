import Link from "next/link";
import Image from "next/image";
import { formatDate } from "~/utils/format-date";

const BlogCard = ({ posts }: any) => {
  return (
    <div className="posts">
      {!posts && <div>No posts!</div>}
      <div className="flex flex-col gap-y-6">
        {posts &&
          posts
            .sort((a: any, b: any) => {
              return new Date(b.frontMatter.publishedDate).getTime() - new Date(a.frontMatter.publishedDate).getTime();
            })
            .map((post: any) => {
              return (
                <Link href={{ pathname: `/blog/${post.slug}` }} key={post.slug}>
                  <article key={post.slug} className="flex justify-between p-2">
                    <div className="flex flex-col mr-8 gap-y-4">
                      <h2>{post.frontMatter.title}</h2>
                      <p>{post.frontMatter.description}</p>
                      <p>{formatDate(post.frontMatter.publishedDate)}</p>
                    </div>
                  </article>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default BlogCard;
