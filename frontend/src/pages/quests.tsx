import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import category from "~/config/category";

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
          config: questConfig,
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [betweenTime, setBetweenTime] = useState<string>("");
  const [andTime, setAndTime] = useState<string>("");

  const handleDayChange = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };
  const handleAddPromptModal = () => {
    console.log("add prompt modal");
    setDisplayAddPromptModal(true);
  };

  interface AddPromptModalProps {
    onSave: () => void;
    onClose: () => void;
    onContinue: () => void;
  }

  interface PromptModalDetsProps {
    onPrevious: () => void;
    onClose: () => void;
    onContinue: () => void;
  }

  interface AddPromptTimesProps {
    onPrevious: () => void;
    onClose: () => void;
    onContinue: () => void;
  }

  const AddPromptModal: React.FC<AddPromptModalProps> = ({ onSave, onClose, onContinue }) => {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Select a category</DialogTitle>
          <DialogDescription>
            <div className="list-disc mt-2">
              <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
                Choose a category that best describes your prompt.
              </label>
              <select value={selectedCategory} onChange={handleChange} className="border rounded-md p-2 my-4 w-full">
                <option value="" disabled>
                  Select a category
                </option>
                {category.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-4">
            <div></div>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const PromptModalDets: React.FC<PromptModalDetsProps> = ({ onPrevious, onClose, onContinue }) => {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Enter Prompt Details</DialogTitle>
          <DialogDescription>
            {/* Add content for the details of the prompt */}
            <div className="list-disc  mt-2">
              <Input
                label="Prompt Text"
                type="text"
                placeholder="eg : are you feeling energetic"
                size="md"
                fullWidth
                className="mt-4"
              />
              <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
                Select response type:
                <select
                  id="activity"
                  className="block w-full mt-4 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select a response type
                  </option>
                  <option>Yes/No</option>
                  <option>Text</option>
                  <option>Number</option>
                  <option>Custom Option</option>
                </select>
              </label>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={onPrevious}>Previous</Button>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const AddPromptTimes: React.FC<AddPromptTimesProps> = ({ onPrevious, onClose, onContinue }) => {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Set time and frequency</DialogTitle>
          <DialogDescription>
            <div className="mt-2">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
                How often should we prompt you?
                <select
                  id="frequency"
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option>Once</option>
                  <option>Every 30 minutes</option>
                  <option>Every hour</option>
                  <option>Every two hours</option>
                </select>
              </label>

              <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
                When do you want to be prompted?
              </label>
              <div className="mt-2">
                <label>Between</label>
                <input
                  placeholder="HH:MM"
                  type="time"
                  id="time"
                  value={betweenTime}
                  onChange={(e) => setBetweenTime(e.target.value)}
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <div className="mt-2">
                <label>And</label>
                <input
                  placeholder="5:00 pM"
                  type="time"
                  id="time"
                  value={andTime}
                  onChange={(e) => setAndTime(e.target.value)}
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mt-6">
                Which days do you want to be prompted?
                <div className="flex flex-wrap mt-4 gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={day}
                        value={day}
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayChange(day)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={day} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </label>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={onPrevious}>Previous</Button>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

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
                className="pt-4 h-40 hidden"
                onChange={(e) => setQuestConfig(e.target.value)}
              />
              <Button onClick={handleAddPromptModal}>Add Prompt</Button>

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
