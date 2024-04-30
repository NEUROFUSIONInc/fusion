import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { api } from "~/config";
import { useSession } from "next-auth/react";

interface IQuest {
  title: string;
  description: string;
  config: string;
  guid: string;
  userGuid: string;
  createdAt: string;
  updatedAt: string;
  joinCode: string;
}

const QuestsPage: NextPage = () => {
  const session = useSession();
  const [questTitle, setQuestTitle] = React.useState<string>("");
  const [questDescription, setQuestDescription] = React.useState<string>("");
  const [questConfig, setQuestConfig] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"create" | "view">("create");
  const [displayShareModal, setDisplayShareModal] = React.useState<boolean>(false);
  const [savedQuests, setSavedQuests] = React.useState<IQuest[]>([]);
  const [activeQuest, setActiveQuest] = React.useState<IQuest | null>(null);

  const saveQuest = async () => {
    try {
      const res = await api.post(
        "/quests",
        {
          title: questTitle,
          description: questDescription,
          config: questConfig,
        },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user?.authToken}`,
          },
        }
      );

      if (res.status === 201) {
        console.log("Quest saved successfully");
        console.log(res.data);
        // send user to the quest detail page
        setSavedQuests([...savedQuests, res.data.quest]);
        setActiveView("view");
      } else {
        console.error("Failed to save quest");
      }
    } catch (error) {
      console.error("Failed to save quest", error);
    }
  };

  const getSavedQuests = async () => {
    try {
      const res = await api.get("/quests", {
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

      if (res.status === 200) {
        console.log("Quests fetched successfully");
        setSavedQuests(res.data.quests);
      } else {
        console.error("Failed to fetch quests");
      }
    } catch (error) {
      console.error("Failed to fetch quests", error);
    }
  };

  React.useEffect(() => {
    getSavedQuests();
  }, []);

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "NeuroFusion | Quests",
        }}
      />{" "}
      <h1 className="text-4xl">Quests</h1>
      {/* Two buttons, one for create another for view */}
      <div className="flex flex-row space-x-4 mt-5">
        <Button onClick={() => setActiveView("view")} intent={activeView == "view" ? "primary" : "integration"}>
          View Quests
        </Button>
        <Button onClick={() => setActiveView("create")} intent={activeView == "create" ? "primary" : "integration"}>
          Configure Quest
        </Button>
      </div>
      {activeView === "create" && (
        <>
          <p className="mb-5 mt-5 text-lg dark:text-slate-400">
            Create a new quest that you want other participants to run
          </p>
          {/* Quest Create Form */}
          <div className="flex flex-col items-center justify-start w-full h-full">
            <div className="y-3 w-full">
              <Input
                label="Title"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Quest Title e.g Validating Wellness Activities"
                value={questTitle}
                className="mb-2"
                onChange={(e) => setQuestTitle(e.target.value)}
              />

              <Input
                label="Description"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Purpose of Quest e.g Let's see what helps you feel better!"
                value={questDescription}
                className="pt-4 h-20 mb-2"
                onChange={(e) => setQuestDescription(e.target.value)}
              />

              <Input
                label="Quest Config"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Prompt Config (JSON)"
                value={questConfig}
                className="pt-4 h-40"
                onChange={(e) => setQuestConfig(e.target.value)}
              />

              <Button type="submit" size="lg" fullWidth className="mt-4" onClick={saveQuest}>
                Save Quest
              </Button>
            </div>
          </div>
        </>
      )}
      {activeView === "view" && (
        <>
          <p className="mb-5 mt-5 text-lg dark:text-slate-400">View all quests that you have created</p>
          {/* Quest View */}
          <table className="w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedQuests.map((quest) => (
                <tr key={quest.guid}>
                  <td>{quest.title}</td>
                  <td>{quest.description}</td>
                  <td className="flex justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveQuest(quest);
                        setDisplayShareModal(true);
                      }}
                    >
                      Share
                    </Button>
                    <Button
                      size="sm"
                      intent="ghost"
                      onClick={() => {
                        setActiveQuest(quest);
                        setActiveView("create");
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {activeQuest && (
        <Dialog open={displayShareModal} onOpenChange={() => setDisplayShareModal(!displayShareModal)}>
          <DialogContent>
            <DialogTitle>Share Quest</DialogTitle>
            <DialogDescription>
              Share the code with participants to join this quest using the Fusion mobile app
            </DialogDescription>
            <div className="flex flex-col space-y-4">
              <Input label="Join Code" type="text" size="lg" value={activeQuest?.joinCode} readOnly />
              <Button size="lg" fullWidth>
                Copy Join Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default QuestsPage;

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
