import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState } from "react";

import { authOptions } from "./api/auth/[...nextauth]";

import { DashboardLayout } from "~/components/layouts";
import { Experiment } from "~/components/lab";

interface Channel {
  name: string;
  x: number;
  y: number;
}

const PlaygroundPage: NextPage = () => {
  return (
    <DashboardLayout>
      <Experiment />
    </DashboardLayout>
  );
};

export default PlaygroundPage;

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
