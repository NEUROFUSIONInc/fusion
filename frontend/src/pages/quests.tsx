import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useContext } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import category from "~/config/category";
import { PromptModalDetsContext, AddPromptModalContext, AddPromptTimesContext } from "~/hooks/modalContext";
import PromptModalDets from "~/components/questmodals/promptdets";
import AddPromptModal from "~/components/questmodals/addprompts";
import AddPromptTimes from "~/components/questmodals/addtimes";
interface IQuest {
  title: string;
  description: string;
  config: string;
  guid: string;
  userGuid: string;
  createdAt: string;
  updatedAt: string;
  joinCode: string;
  organizerName?: string;
  participants?: string[]; // userNpubs
}

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

  const saveQuest = async () => {
    try {
      const res = await api.post(
        "/quest",
        {
          title: questTitle,
          description: questDescription,
          organizerName: questOrganizer,
          config: JSON.stringify(prompts),
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
        setSavedQuests([...savedQuests, res.data.quest]);
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
          config: JSON.stringify(prompts),
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

  const [questSubscribers, setQuestSubscribers] = React.useState<any[]>([]);
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

  const [displayAddPromptModal, setDisplayAddPromptModal] = useState(false);
  const [displayPromptModalDets, setDisplayPromptModalDets] = useState(false);
  const [displayAddPromptTimes, setDisplayAddPromptTimes] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [responseType, setResponseType] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [betweenTime, setBetweenTime] = useState<string>("");
  const [andTime, setAndTime] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  interface Prompt {
    promptText: string;
    selectedCategory: string;
    responseType: string;
    selectedDays: string[];
    betweenTime: string;
    andTime: string;
    frequency: string;
  }

  // Assuming you're using useState, you should type it like this:
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  console.log("prompt text", {
    promptText,
    selectedCategory,
    responseType,
    selectedDays,
    betweenTime,
    andTime,
    frequency,
  });

  const handleAddPromptModal = () => {
    setDisplayAddPromptModal(true);
  };

  const addPrompt = (
    promptText: string,
    selectedCategory: string,
    responseType: string,
    selectedDays: string[],
    betweenTime: string,
    andTime: string,
    frequency: string
  ) => {
    const prompt: Prompt = {
      promptText,
      selectedCategory,
      responseType,
      selectedDays,
      betweenTime,
      andTime,
      frequency,
    };

    setPrompts((prevPrompts: Prompt[]) => [...prevPrompts, prompt]);
  };

  return (
    <AddPromptModalContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      <AddPromptTimesContext.Provider
        value={{
          frequency,
          setFrequency,
          selectedDays,
          setSelectedDays,
          betweenTime,
          setBetweenTime,
          andTime,
          setAndTime,
        }}
      >
        <PromptModalDetsContext.Provider value={{ promptText, setPromptText, responseType, setResponseType }}>
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
              <Button
                onClick={() => setActiveView("create")}
                intent={activeView == "create" ? "primary" : "integration"}
              >
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
                      label="Organized by"
                      type="text"
                      size="lg"
                      fullWidth
                      placeholder="Enter Organizer Name, participants will see this in the app"
                      value={questOrganizer}
                      className="mb-2"
                      onChange={(e) => setQuestOrganizer(e.target.value)}
                    />

                    <Input
                      label="Quest Config"
                      type="text"
                      size="lg"
                      fullWidth
                      placeholder="Enter Prompt Config (JSON)"
                      value={questConfig}
                      className="pt-4 h-40  hidden"
                      onChange={(e) => setQuestConfig(e.target.value)}
                    />

                    <div>
                      {/* Display Added Prompts */}
                      {prompts.length > 0 && (
                        <div className="mt-8">
                          <h2 className=" mb-4">Prompts</h2>
                          <div className="flex flex-wrap gap-6">
                            {prompts.map((prompt, index) => (
                              <div key={index} className="border p-4 rounded-md">
                                <h3 className="font-bold">{prompt.promptText}</h3>
                                <p>Days: {prompt.selectedDays.join(", ")}</p>
                                <p>
                                  Time: {prompt.betweenTime} - {prompt.andTime}
                                </p>
                                <p>Frequency: {prompt.frequency}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-8">
                      {" "}
                      <Button onClick={handleAddPromptModal}>Add Prompt</Button>
                    </div>

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
            {displayAddPromptModal && (
              <AddPromptModal
                onSave={() => {
                  setDisplayAddPromptModal(false);
                }}
                onClose={() => {
                  setDisplayAddPromptModal(false);
                }}
                onContinue={() => {
                  setDisplayAddPromptModal(false);
                  setDisplayPromptModalDets(true);
                }}
              />
            )}
            {displayPromptModalDets && (
              <PromptModalDets
                onPrevious={() => {
                  setDisplayPromptModalDets(false);
                  setDisplayAddPromptModal(true);
                }}
                onClose={() => {
                  setDisplayPromptModalDets(false);
                }}
                onContinue={() => {
                  setDisplayPromptModalDets(false);
                  // Add logic to proceed after completing details
                  setDisplayAddPromptTimes(true);
                }}
              />
            )}

            {displayAddPromptTimes && (
              <AddPromptTimes
                onPrevious={() => {
                  setDisplayAddPromptTimes(false);
                  setDisplayPromptModalDets(true);
                }}
                onClose={() => {
                  setDisplayAddPromptTimes(false);
                }}
                onContinue={() => {
                  setDisplayAddPromptTimes(false);
                  addPrompt(promptText, selectedCategory, responseType, selectedDays, betweenTime, andTime, frequency);
                }}
              />
            )}
          </DashboardLayout>
        </PromptModalDetsContext.Provider>
      </AddPromptTimesContext.Provider>
    </AddPromptModalContext.Provider>
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
