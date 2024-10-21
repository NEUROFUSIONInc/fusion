import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useEffect } from "react";

import { authOptions } from "./api/auth/[...nextauth]";

const PlaygroundPage: NextPage = () => {
  useEffect(() => {
    window.location.href = "/recordings";
  }, []);

  return null;
};

export default PlaygroundPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    const currentUrl = `${req.url}`;
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/recordings",
      permanent: false,
    },
  };
};
