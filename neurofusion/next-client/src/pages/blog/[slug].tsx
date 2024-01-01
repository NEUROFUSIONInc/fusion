import { getAllPostsWithFrontMatter, getFiles, getPostBySlug } from "~/utils/blog";
import MarkdownIt from "markdown-it";
import { MainLayout } from "~/components/layouts";
import dayjs from "dayjs";

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

  return {
    props: {
      frontMatter,
      markdownBody,
    },
  };
}

function BlogPost({ frontMatter, markdownBody }: any) {
  if (!frontMatter) return <></>;

  return (
    <MainLayout>
      <div className="container px-4 mx-auto mt-10 prose md:px-0 mb-10">
        <h1>{frontMatter.title}</h1>
        <p>{dayjs(frontMatter.publishedDate).format("MMM DD, YYYY")}</p>
        <div dangerouslySetInnerHTML={{ __html: md.render(markdownBody) }} />
      </div>
    </MainLayout>
  );
}

(BlogPost as any).theme = "light";

export default BlogPost;
