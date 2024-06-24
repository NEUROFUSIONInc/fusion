import Link from "next/link";
import dayjs from "dayjs";

const BlogCard = ({ posts }: any) => {
  return (
    <div className="posts p-12">
      {!posts && <div>No posts!</div>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts &&
          posts
            .sort((a: any, b: any) => {
              return new Date(b.frontMatter.publishedDate).getTime() - new Date(a.frontMatter.publishedDate).getTime();
            })
            .map((post: any) => {
              const firstTag = post.frontMatter.tags.slice(0, 2);
              return (
                <Link
                  href={{ pathname: `/blog/${post.slug}` }}
                  key={post.slug}
                  className="transition-transform duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between mb-5">
                    <img
                      src={post.frontMatter.coverImage}
                      alt={post.frontMatter.title}
                      className="w-full h-48 object-cover mb-3"
                    />
                    <article key={post.slug} className="flex justify-between p-2">
                      <div className="flex flex-col mr-8 gap-y-4">
                        <h2 className="text-2xl font-medium">{post.frontMatter.title}</h2>
                        <p>{dayjs(post.frontMatter.publishedDate).format("MMM DD, YYYY")}</p>
                        <p>{post.frontMatter.description}</p>
                        <div className="flex gap-2">
                          {firstTag.map((tag: any, index: number) => (
                            <p key={index} className="text-sm bg-gray-200 rounded-full py-1 px-2">
                              {tag}
                            </p>
                          ))}
                        </div>
                      </div>
                    </article>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default BlogCard;
