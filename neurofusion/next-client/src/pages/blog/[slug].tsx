import ReactMarkdown from "react-markdown";
import { getFiles, getPostBySlug } from "~/utils/blog";
import md from "markdown-it";
import { MainLayout } from "~/components/layouts";

export async function getStaticPaths() {
  const posts = await getFiles();

  const paths = posts.map((filename: string) => ({
    params: {
      slug: filename.replace(/\.md/, ""),
    },
  }));

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
      <div className="container px-4 mx-auto mt-8 prose md:px-0">
        <h1>{frontMatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: md().render(markdownBody) }} />
      </div>
    </MainLayout>
  );
}

(BlogPost as any).theme = "light";

export default BlogPost;
