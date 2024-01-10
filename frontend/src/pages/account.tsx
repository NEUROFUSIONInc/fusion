import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Input } from "~/components/ui";
import { useSession } from "next-auth/react";

const AccountPage: NextPage = () => {
  const { data: session } = useSession();
  return (
    <DashboardLayout>
      <h1 className="text-4xl">Profile</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">You have been assigned an anonymous account</p>

      <p>Public Key : {session?.user?.name}</p>

      <p>Private Key</p>

      <div>
        <p className="mt-5">You're on the Fusion Free Plan.</p>

        {/* <Button
          className="mt-5 bg-secondary-900 my-5 text-base text-white"
          intent="dark"
          onClick={() => {
            // send to stripe checkout
          }}
        >
          Upgrade to Fusion Premium
        </Button> */}
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;

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
