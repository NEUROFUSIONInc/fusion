import { getAllPostsWithFrontMatter, getFiles, getPostBySlug } from "~/utils/blog";
import MarkdownIt from "markdown-it";
import { MainLayout, Meta } from "~/components/layouts";
import dayjs from "dayjs";
import BlogCard from "~/components/ui/card/blog-card";
import Link from "next/link";

const md = new MarkdownIt({ html: true });

export async function getStaticPaths() {
  const posts = await getAllPostsWithFrontMatter();

  const paths = Array.isArray(posts)
    ? posts.map((post: any) => ({
        params: {
          slug: post.frontMatter.slug,
        },
      }))
    : [];

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  const { frontMatter, markdownBody } = await getPostBySlug(params.slug);

  const posts = await getAllPostsWithFrontMatter();

  const shuffledPosts = Array.isArray(posts)
    ? posts.filter((post: any) => post.frontMatter.slug !== params.slug).sort(() => Math.random() - 0.5)
    : [];

  return {
    props: {
      frontMatter,
      markdownBody,
      otherArticles: shuffledPosts.slice(0, 2),
    },
  };
}

function BlogPost({ frontMatter, markdownBody, otherArticles }: any) {
  if (!frontMatter) return <></>;
  console.log(otherArticles);

  return (
    <MainLayout>
      <Meta
        meta={{
          title: `${frontMatter.title} | Fusion Blog`,
          description: frontMatter.description,
          image: frontMatter.coverImage,
        }}
      />
      <div className="container px-7 mx-auto mt-24 prose lg:prose-xl md:px-0 mb-10">
        <h1 className="not-prose text-5xl leading-tight text-[#000]">{frontMatter.title}</h1>
        <p>Written by {frontMatter.authors[0].name}</p>
        <p className=" text-gray-500">{dayjs(frontMatter.publishedDate).format("MMM DD, YYYY")}</p>
        <div dangerouslySetInnerHTML={{ __html: md.render(markdownBody) }} className="pb-14 text-justify" />

        {/* Suggestions for other articles */}
        <div className="pt-8">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherArticles.map((article: any) => (
              <Link href={`/blog/${article.slug}`} key={article.slug} className="border no-underline cursor-pointer">
                <div className="cursor-pointer px-4 rounded-lg ">
                  <img
                    src={article.frontMatter.coverImage}
                    alt={article.frontMatter.title}
                    className="w-full h-48 object-cover mb-3"
                  />
                  <h3 className="not-prose text-2xl font-medium">{article.frontMatter.title}</h3>
                  <p className="text-base text-gray-500">
                    {dayjs(article.frontMatter.publishedDate).format("MMM DD, YYYY")}
                  </p>
                  <p className="text-lg text-normal leading-tight">{article.frontMatter.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

(BlogPost as any).theme = "light";

export default BlogPost;
