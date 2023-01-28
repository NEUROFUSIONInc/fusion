import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";

const LabPage: NextPage = () => {
  return <div>Protected page</div>;
};

export default LabPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

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
