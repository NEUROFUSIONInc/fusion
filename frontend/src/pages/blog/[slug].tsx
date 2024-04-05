import { getAllPostsWithFrontMatter, getFiles, getPostBySlug } from "~/utils/blog";
import MarkdownIt from "markdown-it";
import { MainLayout, Meta } from "~/components/layouts";
import dayjs from "dayjs";
import BlogCard from "~/components/ui/card/blog-card";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  

  useEffect(() => {
    const images: NodeListOf<HTMLImageElement> = document.querySelectorAll("img[data-zoomable]");

    images.forEach((image) => {
      image.addEventListener("click", () => {
        console.log("Image clicked:", image.src);
        setZoomedImage(image.src);
        document.body.classList.add("zoomed-in");
      });
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("click", () => {
          setZoomedImage(null);
          document.body.classList.remove("zoomed-in");
        });
      });
    };
  }, []);
  

  if (!frontMatter) return <></>;

  const tags = frontMatter.tags.map((tag: string) => (
    <span key={tag} className="text-base bg-gray-200 rounded-full py-1 px-3 mr-2 mb-2">
      {tag}
    </span>
  ));

  return (
    <MainLayout>
      {zoomedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur">
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-full cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          />
        </div>
      )}
      <Meta
        meta={{
          title: `${frontMatter.title} | Fusion Blog`,
          description: frontMatter.description,
          image: frontMatter.coverImage,
        }}
      />
      <div className="container px-7 mx-auto mt-24 prose lg:prose-xl md:px-0 mb-10">
        <h1 className="text-5xl leading-tight text-[#000] font-semibold not-prose">{frontMatter.title}</h1>
        <p className="not-prose text-[#000] pt-4 font-normal font-semibold text-base">By {frontMatter.authors[0].name}</p>
        <p className="text-gray-500 not-prose text-base">{dayjs(frontMatter.publishedDate).format("MMM DD, YYYY")}</p>
        <div dangerouslySetInnerHTML={{ __html: md.render(markdownBody) }} className="pb-14 text-justify" />

        {/*Reading Tags*/}
        <div className="pt-4 flex flex-wrap gap-2">{tags}</div>

        {/* Suggestions for other articles */}
        <div className="pt-8">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherArticles.map((article: any) => (
              <Link
                href={`/blog/${article.slug}`}
                key={article.slug}
                className="border rounded-md no-underline cursor-pointer"
              >
                <div className="cursor-pointer  rounded-lg ">
                  <img
                    src={article.frontMatter.coverImage}
                    alt={article.frontMatter.title}
                    className="not-prose w-full h-48 object-cover mb-3 mt-0"
                    data-zoomable
                  />

                  <h3 className="not-prose pl-2.5 text-2xl font-medium">{article.frontMatter.title}</h3>
                  <p className="text-base pl-2.5 text-gray-500">
                    {dayjs(article.frontMatter.publishedDate).format("MMM DD, YYYY")}
                  </p>
                  <p className="text-lg pl-2.5 text-normal leading-tight font-normal">
                    {article.frontMatter.description}
                  </p>
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
