import Link from "next/link";
import dayjs from "dayjs";

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
                  <div className="flex flex-row justify-between mb-5">
                    <article key={post.slug} className="flex justify-between p-2">
                      <div className="flex flex-col mr-8 gap-y-4">
                        <h2>{post.frontMatter.title}</h2>
                        <p>{post.frontMatter.description}</p>
                        <p>{dayjs(post.frontMatter.publishedDate).format("MMM DD, YYYY")}</p>
                      </div>
                    </article>
                    <img
                      src={post.frontMatter.coverImage}
                      alt={post.frontMatter.title}
                      className="w-1/3 object-contain ml-3 br-10"
                    />
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default BlogCard;
