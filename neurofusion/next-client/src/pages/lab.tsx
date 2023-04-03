import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";

const LabPage: NextPage = () => {
  return <div>Protected page</div>;
};

export default LabPage;

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
