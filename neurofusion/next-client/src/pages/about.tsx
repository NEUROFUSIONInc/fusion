import type { NextPage } from "next";
import { useEffect } from "react";

import { MainLayout } from "~/components/layouts";

const About: NextPage = () => {
  useEffect(() => {
    window.location.href =
      "https://neurofusionresearchinc.notion.site/NEUROFUSION-Team-39887d6b988c4c83ae2a16ae8db44a45";
  }, []);

  return <MainLayout />;
};

(About as any).theme = "dark";

export default About;
