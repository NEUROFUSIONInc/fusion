import { FC, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button/button";
import { appInsights } from "~/utils/appInsights";

const Custom404: FC = () => {
  useEffect(() => {
    appInsights.trackPageView({ name: "404 - Page Not Found" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image src="/images/logo.png" alt="NeuroFusion Logo" width={200} height={100} />
      <h1 className="text-4xl font-bold mt-8 mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link href="/" passHref>
        <Button size="lg">Go back to homepage</Button>
      </Link>
    </div>
  );
};

export default Custom404;
