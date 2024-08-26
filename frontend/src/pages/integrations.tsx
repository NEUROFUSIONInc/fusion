import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";

import { IntegrationsContainer } from "~/components/features/integrations";
import { DashboardLayout, Meta } from "~/components/layouts";

const IntegrationsPage: NextPage = () => {
  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Integrations | NeuroFusion",
        }}
      />
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
