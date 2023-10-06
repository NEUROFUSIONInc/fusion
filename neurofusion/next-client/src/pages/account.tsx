import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Input } from "~/components/ui";

const AccountPage: NextPage = () => {
  return (
    <DashboardLayout>
      <h1 className="text-4xl">Profile</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">Manage your Fusion account</p>
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
