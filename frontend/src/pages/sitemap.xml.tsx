import { GetServerSideProps } from "next";
import { getAllPostsWithFrontMatter } from "~/utils/blog";

const Sitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env["NEXTAUTH_URL"] || "https://usefusion.ai";

  const blogs = (await getAllPostsWithFrontMatter()).map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontMatter.publishedDate).toISOString(),
  }));

  const staticPages = [
    "",
    "/research",
    "/blog",
    "/recordings",
    "/analysis",
    // Add other static routes here
  ].map((route) => `${baseUrl}${route}`);

  const allPages = [...staticPages, ...blogs.map((blog) => blog.url)];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPages
        .map((url) => {
          const lastmod = url.includes("/blog/")
            ? blogs.find((blog) => blog.url === url)?.lastModified
            : new Date().toISOString();
          const changefreq = url === baseUrl ? "daily" : url.includes("/blog/") ? "monthly" : "weekly";
          const priority = url === baseUrl ? "1.0" : url.includes("/blog/") ? "0.6" : "0.8";
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${lastmod}</lastmod>
              <changefreq>${changefreq}</changefreq>
              <priority>${priority}</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
