import fs from "fs";
import path from "path";
import matter from "gray-matter";

const root = process.cwd();

export async function getFiles() {
  return fs.readdirSync(path.join(root, "public/posts"), "utf-8");
}

export async function getPostBySlug(slug: string) {
  const files = fs.readdirSync(path.join(root, "public/posts"));

  const matchingFile = files.find((file) => {
    const source = fs.readFileSync(path.join(root, "public/posts", file), "utf8");
    const { data } = matter(source);
    return data.slug === slug;
  });

  if (!matchingFile) {
    throw new Error(`No post found with slug: ${slug}`);
  }
  console.log("matchingFile", matchingFile);
  const source = fs.readFileSync(path.join(root, "public/posts", matchingFile), "utf8");
  const { data, content } = matter(source);

  return {
    frontMatter: data,
    markdownBody: content,
  };
}

export async function getAllPostsWithFrontMatter() {
  const files = fs.readdirSync(path.join(root, "public/posts"));

  // @ts-ignore
  return files.reduce((allPosts, postPath) => {
    const source = fs.readFileSync(path.join(root, "public/posts", postPath), "utf8");
    const { data } = matter(source);

    return [
      {
        frontMatter: data,
        slug: data.slug,
      },
      ...allPosts,
    ];
  }, []);
}
