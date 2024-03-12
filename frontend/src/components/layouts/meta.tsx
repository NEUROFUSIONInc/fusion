import Head from "next/head";
import { useRouter } from "next/router";
import { MetaSeo } from "~/@types";

const URL = "https://usefusion.app";

export const metaDefaults = {
  title: "Fusion Copilot - Personal Insights to Guide Your Daily Actions",
  description: "Use Fusion to understand changes in your health & behavior to improve your quality of life",
  image: `${URL}/images/fusion_banner_new.png`,
  baseUrl: URL,
  feed: `${URL}/`,
  keywords: [
    "technology",
    "neuroscience",
    "behavior",
    "health",
    "data",
    "integrations",
    "explorers",
    "researchers",
    "data",
    "privacy",
    "wellbeing",
    "startup",
  ],
  author: {
    name: "NEUROFUSION Research Inc.",
  },
  social: {
    twitter: "usefusionapp",
    github: "NEUROFUSIONInc",
  },
};

export const Meta = ({ meta: pageMeta }: { meta?: Partial<MetaSeo> }) => {
  const router = useRouter();
  const meta = {
    ...metaDefaults,
    ...pageMeta,
  };

  return (
    <Head>
      <meta charSet="UTF-8" />
      <title>{meta.title}</title>
      <meta content={meta.description} name="description" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta content={meta.keywords.join(", ")} name="keywords" />
      {/** OpenGraph Metadata */}
      <meta property="og:url" content={`${URL}${router.asPath}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Fusion by NEUROFUSION Research Inc." />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="628" />
      {/** End OpenGraph Metadata */}
      {/** Twitter Metadata */}
      <meta name="twitter:card" content="app" />
      <meta name="twitter:site" content="@usefusionapp" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:app:name:iphone" content="Fusion Copilot" />
      <meta name="twitter:app:id:iphone" content="6445860500" />
      <meta name="twitter:app:name:googleplay" content="Fusion Copilot" />
      <meta name="twitter:app:id:googleplay" content="com.neurofusion.fusion" />
      {/** End Twitter Metadata */}
    </Head>
  );
};
