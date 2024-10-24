// this is what will contain the dashboard

import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { DashboardLayout, Meta } from "~/components/layouts";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "~/components/ui";
import React, { useCallback } from "react";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import { DisplayCategory, FusionHealthDataset, FusionQuestDataset, IExperiment, IQuest } from "~/@types";
import { usePathname } from "next/navigation";
import { FusionLineChart } from "~/components/charts";
import dayjs from "dayjs";
import { ShareModal } from "~/components/quests";
import { Experiment } from "~/components/lab";

const categories: DisplayCategory[] = [
  {
    name: "Steps",
    value: "steps",
  },
  {
    name: "Sleep",
    value: "sleep",
  },
  {
    name: "Heart Rate",
    value: "heart_rate",
  },
];

interface FusionConsentClaim {
  [key: string]: string | number;
  timestamp: number;
}

export interface FusionQuestSubscriber {
  userNpub: string;
  consentClaims: FusionConsentClaim[];
}

const QuestDetailPage: NextPage = () => {
  const [quest, setQuest] = React.useState<IQuest | null>(null);
  const [experiment, setExperiment] = React.useState<IExperiment | null>(null);
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

        await updateQuestDatasets();
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

  const [questDatasets, setQuestDatasets] = React.useState<FusionQuestDataset[]>([]);
  const getQuestDatasets = async (questId: string) => {
    try {
      const res = await api.get(
        "/quest/datasets",

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
        console.log("Quest Dataset fetched successfully");

        return res.data.userQuestDatasets;
      } else {
        console.error("Failed to fetch quest dataset");
      }
    } catch (error) {
      console.error("Failed to fetch quest dataset", error);
    }
  };
  const updateQuestDatasets = useCallback(async () => {
    if (questId) {
      const questDatasets = await getQuestDatasets(questId);
      questDatasets.map((dataset: any) => {
        dataset.value = JSON.parse(dataset.value) as FusionHealthDataset[];
      });

      console.log("updated quest object", questDatasets);

      if (questDatasets) {
        setQuestDatasets(questDatasets);
      }
    }
  }, [questId]);

  const [category, setCategory] = React.useState<DisplayCategory>(categories[0]);

  const [displayShareModal, setDisplayShareModal] = React.useState(false);

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

      {/* if the quest contains an experiment link, embed it */}
      {experiment && (
        <div className="mt-5">
          <h3 className="text-xl mb-2">Experiment</h3>
          <Experiment {...experiment} />
        </div>
      )}

      <div className="flex space-x-2 gap-x-2 mt-4">
        <Button
          className=""
          onClick={() => {
            setDisplayShareModal(true);
          }}
        >
          Share Quest
        </Button>
        {/* // TODO: gate this with zupass */}
        {/* <Button intent="primary" className="">
          Download Data
        </Button> */}
        <Button className="" intent="primary" onClick={updateQuestDatasets}>
          Refresh
        </Button>
      </div>

      {/* dynamic content based on colelcted data */}
      <div className="mt-5">
        {/* category selection */}

        {/* display the graph */}
        {questDatasets && questDatasets.length > 0 && (
          <>
            <div className="mt-5">
              <div className="mb-4">
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Category
                </label>
                <select
                  id="category-select"
                  className="block w-64 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  value={category?.value}
                  onChange={(e) => setCategory(categories.find((cat) => cat.value === e.target.value) || categories[0])}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <p>{category?.name} in the past week</p>
              <FusionLineChart
                key={`${category?.value}-${Math.random()}`}
                seriesData={questDatasets}
                timePeriod="week"
                startDate={dayjs().startOf("day")}
                category={category}
              />
            </div>
          </>
        )}

        {quest && (
          <ShareModal
            quest={quest!}
            displayShareModal={displayShareModal}
            setDisplayShareModal={setDisplayShareModal}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuestDetailPage;

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
    props: { session },
  };
};
