import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { IntegrationsContainer } from "~/components/features/integrations";
import { DashboardLayout } from "~/components/layouts";

import { authOptions } from "./api/auth/[...nextauth]";

const IntegrationsPage: NextPage = () => {
  return (
    <DashboardLayout>
      <IntegrationsContainer />
    </DashboardLayout>
  );
};

export default IntegrationsPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
