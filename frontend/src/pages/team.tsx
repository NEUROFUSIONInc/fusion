import type { NextPage } from "next";
import { TeamSection } from "~/components/features/landing";

import { MainLayout } from "~/components/layouts";

const Team: NextPage = () => {
  return (
    <MainLayout>
      <TeamSection />
    </MainLayout>
  );
};

(Team as any).theme = "light";

export default Team;
