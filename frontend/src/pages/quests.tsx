import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useContext } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AddPromptModal from "~/components/quest/addprompts";
import { IQuest, Prompt } from "~/@types";
import { promptSelectionDays } from "~/config/data";

const QuestsPage: NextPage = () => {
  const session = useSession();
  const [questTitle, setQuestTitle] = React.useState<string>("");
  const [questDescription, setQuestDescription] = React.useState<string>("");
  const [questOrganizer, setQuestOrganizer] = React.useState<string>("");
  const [questConfig, setQuestConfig] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"create" | "view" | "edit">("create");
  const [displayShareModal, setDisplayShareModal] = React.useState<boolean>(false);
  const [savedQuests, setSavedQuests] = React.useState<IQuest[]>([]);
  const [activeQuest, setActiveQuest] = React.useState<IQuest | null>(null);
  const [questSubscribers, setQuestSubscribers] = React.useState<any[]>([]);

  const saveQuest = async () => {
    try {
      const res = await api.post(
        "/quest",
        {
          title: questTitle,
          description: questDescription,
          organizerName: questOrganizer,
          config: JSON.stringify({ prompts: prompts }),
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
        setSavedQuests([...savedQuests, { ...res.data.quest, prompts: JSON.parse(res.data.quest.config) }]); // Parse config back to prompts array

        console.log(res.data.quest);
        setActiveView("view");
      } else {
        console.error("Failed to save quest");
      }
    } catch (error) {
      console.error("Failed to save quest", error);
    }
  };

  const editQuest = async () => {
    try {
      const res = await api.post(
        "/quest/edit",
        {
          title: questTitle,
          description: questDescription,
          organizerName: questOrganizer,
          config: JSON.stringify({ prompts: prompts }),
          guid: activeQuest?.guid,
        },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user?.authToken}`,
          },
        }
      );

      if (res.status === 200) {
        console.log("Quest edited successfully");
        console.log(res.data);
        const updatedQuests = savedQuests.map((quest) => {
          if (quest.guid === res.data.quest.guid) {
            return res.data.quest;
          }
          return quest;
        });

        setSavedQuests(updatedQuests);

        setActiveView("view");
      } else {
        console.error("Failed to edit quest");
      }
    } catch (error) {
      console.error("Failed to edit quest", error);
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

  const getQuestSubscribers = async (questId: string) => {
    try {
      const res = await api.get("/quest/subscribers", {
        params: {
          questId,
        },
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

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

  React.useEffect(() => {
    getSavedQuests();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (activeQuest) {
        const subscribers = await getQuestSubscribers(activeQuest.guid);
        console.log("subscribers", subscribers);

        if (subscribers) {
          setQuestSubscribers(subscribers);
        } else {
          setQuestSubscribers([]);
        }
      }
    })();
  }, [activeQuest]);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [displayAddPromptModal, setDisplayAddPromptModal] = useState(false);
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);

  const handleAddPromptModal = () => {
    const newPrompt: Prompt = {
      uuid: "",
      promptText: "",
      responseType: "text", // Assuming "text" is a valid PromptResponseType
      notificationConfig_days: promptSelectionDays,
      notificationConfig_startTime: "",
      notificationConfig_endTime: "",
      notificationConfig_countPerDay: 0, // Assuming 0 is a valid default value for countPerDay
      additionalMeta: {},
    };
    setEditingPromptIndex(null);
    setActivePrompt(newPrompt);
  };

  const handleEditPrompt = (index: number) => {
    const promptToEdit = prompts[index];
    console.log("promptToEdit", promptToEdit);
    setEditingPromptIndex(index);
    setActivePrompt(promptToEdit);
  };

  const handleDeletePrompt = (index: number) => {
    setPrompts((prevPrompts) => prevPrompts.filter((_, i) => i !== index));
  };

  // preload the prompts from questConfig
  React.useEffect(() => {
    if (questConfig) {
      console.log("questConfig", questConfig);
      // make sure it's valid
      // handle based on if it's an array (old way) / or object with prompt key
      const parsedConfig = JSON.parse(questConfig);
      if (Array.isArray(parsedConfig)) {
        setPrompts(parsedConfig);
      } else if (parsedConfig && parsedConfig.prompts && Array.isArray(parsedConfig.prompts)) {
        setPrompts(parsedConfig.prompts);
      }
    }
  }, [questConfig]);

  React.useEffect(() => {
    console.log("activePrompt", activePrompt);
    if (activePrompt) {
      setDisplayAddPromptModal(true);
    }
  }, [activePrompt]);

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "NeuroFusion | Quests",
          description:
            "Create and manage quests for your participants to run. Wearables. Behavior Tracking. Health Data.",
        }}
      />
      <h1 className="text-4xl">Quests</h1>
      <div className="flex flex-row space-x-4 mt-5">
        <Button onClick={() => setActiveView("view")} intent={activeView == "view" ? "primary" : "integration"}>
          View Quests
        </Button>
        <Button onClick={() => setActiveView("create")} intent={activeView == "create" ? "primary" : "integration"}>
          Create Quest
        </Button>
      </div>
      {["create", "edit"].includes(activeView) && (
        <>
          <p className="mb-5 mt-5 text-lg dark:text-slate-400">
            Create a new quest that you want other participants to run
          </p>
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
                required
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
                required
              />

              <Input
                label="Organized by"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Organizer Name. Participants will see this in the app"
                value={questOrganizer}
                className="mb-2"
                onChange={(e) => setQuestOrganizer(e.target.value)}
                required
              />

              <Input
                label="Configure prompts you want people to respond to"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Prompt Config (JSON)"
                value={questConfig}
                className="h-40  hidden"
                onChange={(e) => setQuestConfig(e.target.value)}
              />

              <div className="mt-4">
                <Button onClick={handleAddPromptModal} leftIcon={<Plus />}>
                  Add Prompt
                </Button>
              </div>

              {/* Prompt Cards */}
              {prompts.length > 0 && (
                <div className="mt-8">
                  <div className="flex flex-wrap gap-6">
                    {prompts.map((prompt, index) => (
                      <div key={index} className="border p-4 rounded-md">
                        <h3 className="font-bold">{prompt.promptText}</h3>
                        <p>
                          Days:
                          {Object.keys(prompt.notificationConfig_days)
                            .filter(
                              (day) =>
                                prompt.notificationConfig_days[day as keyof typeof prompt.notificationConfig_days]
                            )
                            .join(", ")}
                        </p>
                        <p>
                          Time: {prompt.notificationConfig_startTime} - {prompt.notificationConfig_endTime}
                        </p>
                        <p>Frequency: {prompt.notificationConfig_countPerDay}</p>

                        <div className="mt-2 space-x-2">
                          <Button size="sm" onClick={() => handleEditPrompt(index)}>
                            Edit
                          </Button>
                          <Button size="sm" intent="ghost" onClick={() => handleDeletePrompt(index)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                className="mt-4"
                onClick={async () => {
                  if (activeView === "edit") {
                    await editQuest();
                  } else {
                    await saveQuest();
                  }
                }}
              >
                Save Quest
              </Button>
            </div>
          </div>
        </>
      )}
      {activeView === "view" && (
        <>
          <p className="mb-5 mt-5 text-lg dark:text-slate-400">View all quests that you have created</p>
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
                  <Link href={`/quest/${quest.guid}`}>
                    <td className="underline">{quest.title}</td>
                  </Link>
                  <td>{quest.description}</td>
                  {quest.prompts && <td></td>}
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
                        setQuestTitle(quest.title);
                        setQuestDescription(quest.description);
                        setQuestConfig(quest.config);
                        setQuestOrganizer(quest.organizerName ?? "");
                        setActiveView("edit");
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
      {/* Display Share Modal */}
      {activeQuest && (
        <Dialog open={displayShareModal} onOpenChange={() => setDisplayShareModal(!displayShareModal)}>
          <DialogContent>
            <DialogTitle>Share Quest</DialogTitle>
            <div>
              <div>Active Participants: {questSubscribers.length}</div>
            </div>
            <DialogDescription>
              Share the code with your participants to join this quest using the Fusion mobile app
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

      {/* Prompt Create/Edit Modal */}
      {displayAddPromptModal && activePrompt && (
        <AddPromptModal
          prompt={activePrompt}
          setPrompt={setActivePrompt}
          onSave={(prompt) => {
            // first update the active entry
            setActivePrompt(prompt);
            // then update the prompts array
            console.log("editingPromptIndex", editingPromptIndex);

            if (editingPromptIndex !== null) {
              setPrompts((prevPrompts) => {
                const updatedPrompts = [...prevPrompts];
                updatedPrompts[editingPromptIndex] = prompt;
                return updatedPrompts;
              });
            } else {
              setPrompts((prevPrompts) => [...prevPrompts, prompt]);
            }
            setActivePrompt(null);
            setEditingPromptIndex(null);
            setDisplayAddPromptModal(false);
          }}
          onClose={() => {
            setActivePrompt(null);
            setDisplayAddPromptModal(false);
          }}
        />
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
