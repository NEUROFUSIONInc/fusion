// this is what will contain the dashboard

import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { DashboardLayout, Meta } from "~/components/layouts";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "~/components/ui";
import React from "react";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import { IQuest } from "~/@types";
import { usePathname } from "next/navigation";

const QuestDetailPage: NextPage = () => {
  const [quest, setQuest] = React.useState<IQuest | null>(null);
  const pathname = usePathname();

  // get the last part of the pathname
  const questId = pathname.split("/").pop();

  const session = useSession();
  // fetch the quest info
  React.useEffect(() => {
    // maker request to backend to get quest info
    (async () => {
      const res = await api.get("/quest/detail", {
        params: {
          questId,
        },
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

      if (res.status === 200) {
        const data = res.data;
        setQuest(data.quest);

        const questSubscribers = await getQuestSubscribers(questId!);
        if (questSubscribers) {
          setQuestSubscribers(questSubscribers);
        }
      }
    })();
  }, []);

  // TODO: move to quest.service.ts
  const [questSubscribers, setQuestSubscribers] = React.useState<any[]>([]);
  const getQuestSubscribers = async (questId: string) => {
    try {
      const res = await api.get(
        "/quest/subscribers",

        {
          params: {
            questId,
          },
          headers: {
            Authorization: `Bearer ${session.data?.user?.authToken}`,
          },
        }
      );

      if (res.status === 200) {
        console.log("Quest Subscribers fetched successfully");
        console.log(res.data);
        return res.data.userQuests;
      } else {
        console.error("Failed to fetch quest subscribers");
      }
    } catch (error) {
      console.error("Failed to fetch quest subscribers", error);
    }
  };

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: `${quest?.title ?? "Quest"} | NeuroFusion Explorer`,
          description: `${quest?.description ?? ""}`,
        }}
      />
      <h1 className="text-4xl">Quest</h1>

      {/* display overall quest details */}
      <div className="mt-5">
        <h2 className="text-2xl">{quest?.title}</h2>
        <p className="mt-2">{quest?.description}</p>

        <p className="mt-2">Active Participants: {questSubscribers.length}</p>
      </div>

      <Button intent="primary" className="mt-4">
        Download Data
      </Button>
    </DashboardLayout>
  );
};

export default QuestDetailPage;

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
