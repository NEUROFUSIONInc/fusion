import type { NextPage } from "next";
import { Magic } from "magic-sdk";

import { Navbar } from "~/components/layouts";

const magic = typeof window !== "undefined" && new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#13122D_1%] via-[#011227_65%] to-[#191230_100%]  p-2">
      <Navbar />
    </div>
  );
};

export default Home;
