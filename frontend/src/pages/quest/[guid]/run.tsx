import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useEffect } from "react";

import { authOptions } from "~/pages/api/auth/[...nextauth]";

import { Experiment } from "~/components/lab";
import { DashboardLayout, Meta } from "~/components/layouts";
import { OnboardingModal } from "~/components/modals";
import { useRouter } from "next/router";
import { IExperiment, IQuest } from "~/@types";
import { api } from "~/config/api";
import { useSession } from "next-auth/react";

const QuestRunPage: NextPage = () => {
  const [quest, setQuest] = React.useState<IQuest | null>(null);
  const [experimentCode, setExperimentCode] = React.useState<string | null>(null);

  const { guid } = useRouter().query;
  const session = useSession();

  useEffect(() => {
    if (guid) {
      // maker request to backend to get quest info
      (async () => {
        const res = await api.get("/quest/detail", {
          params: {
            questId: guid,
          },
          headers: {
            Authorization: `Bearer ${session.data?.user?.authToken}`,
          },
        });

        if (res.status === 200) {
          const data = res.data;
          setQuest(data.quest);
        }
      })();
    }
  }, [guid]);

  useEffect(() => {
    if (quest?.config) {
      const experimentConfig = JSON.parse(quest.config)["experimentConfig"];
      if (experimentConfig) {
        setExperimentCode(experimentConfig);
      }
    }
  }, [quest]);

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: `${quest?.title} | NeuroFusion`,
          description:
            "The simplest way to record and analyze your brain activity. Choose from a variety of cognitive experiments to record your brain activity and see results.",
          image: "https://usefusion.app/images/features/neurofusion_experiment.png",
        }}
      />
      <h1 className="text-4xl">{quest?.title}</h1>
      {experimentCode && (
        <Experiment id={0} name={quest?.title || ""} description={quest?.description || ""} code={experimentCode} />
      )}
      <OnboardingModal />
    </DashboardLayout>
  );
};

export default QuestRunPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    // login the user
    const currentUrl = `${req.url}`;
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
