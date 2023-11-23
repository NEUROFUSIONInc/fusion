import fs from "fs";
import path from "path";
import matter from "gray-matter";

const root = process.cwd();

export async function getFiles() {
  return fs.readdirSync(path.join(root, "src/articles"), "utf-8");
}

// export async function getPostBySlug(dataType: string, slug: string) {
export async function getPostBySlug(slug: string) {
  const source = fs.readFileSync(path.join(root, "src/articles", `${slug}.md`), "utf8");

  const { data, content } = matter(source);

  return {
    frontMatter: data,
    markdownBody: content,
  };
}

export async function getAllPostsWithFrontMatter() {
  const files = fs.readdirSync(path.join(root, "src/articles"));

  // @ts-ignore
  return files.reduce((allPosts, postSlug) => {
    const source = fs.readFileSync(path.join(root, "src/articles", postSlug), "utf8");
    const { data } = matter(source);

    return [
      {
        frontMatter: data,
        slug: postSlug.replace(".md", ""),
      },
      ...allPosts,
    ];
  }, []);
}
