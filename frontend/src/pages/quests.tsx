import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React, { useState, useContext } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Pencil, Plus, Save, Trash } from "lucide-react";
import AddPromptModal from "~/components/quest/addprompts";
import { healthDataCategories, IQuest, IQuestConfig, OnboardingQuestion, Prompt, QuestAssignment } from "~/@types";
import { promptSelectionDays } from "~/config/data";
import { ExperimentEditor } from "~/components/lab";
import { AddOnboardingQuestionModal } from "~/components/quest/addquestions";
import { useRouter, useSearchParams } from "next/navigation";
import { ShareModal } from "~/components/quests/share-modal";
import AssignmentEditor from "~/components/quest/assigment-editor";
import { NotebookEditor } from "~/components/lab/notebook-editor";

const QuestsPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const urlParams = useSearchParams();
  const [questTitle, setQuestTitle] = React.useState<string>("");
  const [questDescription, setQuestDescription] = React.useState<string>("");
  const [questOrganizer, setQuestOrganizer] = React.useState<string>("");
  const [questConfig, setQuestConfig] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"create" | "view" | "edit" | undefined>();
  const [displayShareModal, setDisplayShareModal] = React.useState<boolean>(false);
  const [savedQuests, setSavedQuests] = React.useState<IQuest[]>([]);
  const [activeQuest, setActiveQuest] = React.useState<IQuest | null>(null);
  const [questSubscribers, setQuestSubscribers] = React.useState<any[]>([]);

  const [experimentConfig, setExperimentConfig] = React.useState<string>("");
  const [showExperimentEditor, setShowExperimentEditor] = React.useState<boolean>(false);

  const [scriptConfig, setScriptConfig] = React.useState<string>("");
  const [showScriptEditor, setShowScriptEditor] = React.useState<boolean>(false);

  const buildQuestRequestBody = (isEdit: boolean = false, guid: string = "") => {
    const questObject: {
      title: string;
      description: string;
      organizerName: string;
      config: string;
      guid?: string;
    } = {
      title: questTitle,
      description: questDescription,
      organizerName: questOrganizer,
      config: JSON.stringify({
        prompts: prompts,
        onboardingQuestions: onboardingQuestions,
        collaborators: collaborators, // comma separated public keys
        experimentConfig: experimentConfig, // it's the code for the experiment in html format
        healthDataConfig: healthDataConfig,
        assignmentConfig: assignmentConfig,
        scriptConfig: scriptConfig, // .py code to be run after an experiment is complete
      }),
      ...(isEdit ? { guid } : {}),
    };

    return questObject;
  };

  const saveQuest = async () => {
    if (!questTitle.trim() || !questDescription.trim() || !questOrganizer.trim() || prompts.length === 0) {
      alert("All fields must be filled and at least one prompt must be added");
      return;
    }
    try {
      const res = await api.post("/quest", buildQuestRequestBody(), {
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

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
    if (!questTitle.trim() || !questDescription.trim() || !questOrganizer.trim() || prompts.length === 0) {
      alert("All fields must be filled and at least one prompt must be added");
      return;
    }
    try {
      const res = await api.post("/quest/edit", buildQuestRequestBody(true, activeQuest?.guid ?? ""), {
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

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
    // Check if we're on the base /quests path with no parameters
    if (window.location.pathname === "/quests" && !urlParams.toString()) {
      setActiveView("view");
    }
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

  // handle edit from create page
  React.useEffect(() => {
    if (activeView == "view" || activeView == "create") {
      getSavedQuests();
      // Clear all form entries and URL params
      setQuestTitle("");
      setQuestDescription("");
      setQuestOrganizer("");
      setQuestConfig("");
      setPrompts([]);
      setCollaborators("");
      setExperimentConfig("");
      setOnboardingQuestions([]);
      setHealthDataConfig(
        healthDataCategories.reduce((acc: { [key: string]: boolean }, category) => {
          acc[category.value] = false;
          return acc;
        }, {})
      );
      router.replace(window.location.pathname);
    }
    if (activeView == "edit" && activeQuest) {
      // Set URL params for guid and action
      const url = new URL(window.location.href);
      url.searchParams.set("guid", activeQuest.guid);
      url.searchParams.set("action", "edit");
      window.history.pushState({}, "", url);
    }
  }, [activeView, activeQuest]);

  // handle direct edit link
  React.useEffect(() => {
    const guid = urlParams.get("guid");
    const action = urlParams.get("action");

    if (guid && action === "edit") {
      // Find the quest in savedQuests that matches the guid
      const quest = savedQuests.find((q) => q.guid === guid);
      if (quest) {
        setActiveQuest(quest);
        setQuestTitle(quest.title);
        setQuestDescription(quest.description);
        setQuestConfig(quest.config);
        setQuestOrganizer(quest.organizerName ?? "");
        setActiveView("edit");
      }
    }
  }, [savedQuests, urlParams]);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [collaborators, setCollaborators] = useState<string>(""); // comma separated public keys

  /* Health Data Configuration - Start */
  const [healthDataConfig, setHealthDataConfig] = useState<{ [key: string]: boolean }>(
    healthDataCategories.reduce((acc: { [key: string]: boolean }, category) => {
      acc[category.value] = false;
      return acc;
    }, {})
  );

  const handleHealthDataConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setHealthDataConfig((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  /* Health Data Configuration - End */

  /* Onboarding Questions - Start */
  const [activeOnboardingQuestion, setActiveOnboardingQuestion] = useState<OnboardingQuestion | null>(null);
  const [onboardingQuestions, setOnboardingQuestions] = useState<OnboardingQuestion[]>([]);
  const [editingOnboardingQuestionIndex, setEditingOnboardingQuestionIndex] = useState<number | null>(null);

  const handleAddOnboardingQuestionModal = () => {
    const newOnboardingQuestion: OnboardingQuestion = {
      guid: crypto.randomUUID(),
      question: "",
      type: "yesno",
      required: true,
    };
    setEditingOnboardingQuestionIndex(null);
    setActiveOnboardingQuestion(newOnboardingQuestion);
  };

  const handleEditOnboardingQuestion = (index: number) => {
    const questionToEdit = onboardingQuestions[index];
    console.log("questionToEdit", questionToEdit);
    setEditingOnboardingQuestionIndex(index);
    setActiveOnboardingQuestion(questionToEdit);
  };

  const handleDeleteOnboardingQuestion = (index: number) => {
    setOnboardingQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  };
  /* Onboarding Questions - End */

  /* Prompt Configuration - Start */
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [displayAddPromptModal, setDisplayAddPromptModal] = useState(false);
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);

  const handleAddPromptModal = () => {
    const newPrompt: Prompt = {
      uuid: crypto.randomUUID(),
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
  /* Prompt Configuration - End */

  /* Assigment Configuration - Start */
  const [assignmentConfig, setAssignmentConfig] = useState<QuestAssignment | null>();
  const [showAssignmentEditor, setShowAssignmentEditor] = useState<boolean>(false);
  /* Assigment Configuration - End */

  // preload data from questConfig
  React.useEffect(() => {
    if (questConfig) {
      console.log("questConfig", questConfig);
      // make sure it's valid
      // handle based on if it's an array (old way) / or object with prompt key
      const parsedConfig = JSON.parse(questConfig) as IQuestConfig;
      if (Array.isArray(parsedConfig)) {
        setPrompts(parsedConfig);
      } else if (parsedConfig) {
        setPrompts(parsedConfig.prompts ?? []);
        setOnboardingQuestions(parsedConfig.onboardingQuestions ?? []);
        setCollaborators(parsedConfig.collaborators ?? "");
        setExperimentConfig(parsedConfig.experimentConfig ?? "");
        setHealthDataConfig(
          parsedConfig.healthDataConfig ??
            healthDataCategories.reduce((acc: { [key: string]: boolean }, category) => {
              acc[category.value] = false;
              return acc;
            }, {})
        );
        setAssignmentConfig(parsedConfig.assignmentConfig ?? null);
        setScriptConfig(parsedConfig.scriptConfig ?? "");
      }
    }
  }, [questConfig]);

  React.useEffect(() => {
    console.log("activePrompt", activePrompt);
    if (activePrompt) {
      setDisplayAddPromptModal(true);
    }
  }, [activePrompt]);

  const [showAdvancedQuestSettings, setShowAdvancedQuestSettings] = useState<boolean>(false);
  const [vitalApiKey, setVitalApiKey] = useState<string>("");
  const [vitalEnvironment, setVitalEnvironment] = useState<string>("sandbox");
  const [vitalRegion, setVitalRegion] = useState<string>("us");
  const [giftCardCodes, setGiftCardCodes] = useState<string>("");
  const [giftCardCodesHistory, setGiftCardCodesHistory] = useState<string>("");
  React.useEffect(() => {
    try {
      if (activeQuest && showAdvancedQuestSettings) {
        api
          .get(`/quest/config`, {
            params: {
              questId: activeQuest.guid,
            },
            headers: {
              Authorization: `Bearer ${session.data?.user?.authToken}`,
            },
          })
          .then((res) => {
            console.log("res", res);
            if (res.status === 200) {
              const parsedConfig = JSON.parse(res.data.value);
              setVitalApiKey(parsedConfig.vital_api_key ?? "");
              setVitalEnvironment(parsedConfig.vital_environment ?? "");
              setVitalRegion(parsedConfig.vital_region ?? "");
              setGiftCardCodes(parsedConfig.gift_card_codes ?? "");
              setGiftCardCodesHistory(parsedConfig.gift_card_codes_history ?? "");
            }
          })
          .catch((e) => {
            console.error("Failed to fetch advanced quest config", e);
          });
      }
    } catch (e) {
      console.error("Failed to fetch advanced quest config", e);
    }
  }, [activeQuest, showAdvancedQuestSettings]);

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Quests | NeuroFusion",
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
      {activeView && ["create", "edit"].includes(activeView) && (
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
                label="Collaborators"
                type="text"
                size="lg"
                fullWidth
                placeholder="Enter Fusion public keys of collaborators (comma-separated)"
                value={collaborators}
                className="mb-2"
                onChange={(e) => setCollaborators(e.target.value)}
              />

              <div className="mt-4">
                <Input
                  label="Configure onboarding and informed consent questions"
                  type="text"
                  size="lg"
                  className="h-40  hidden"
                />

                <Button onClick={handleAddOnboardingQuestionModal} leftIcon={<Plus />}>
                  Add Onboarding Question
                </Button>

                {onboardingQuestions.length > 0 && (
                  <div className="mt-5">
                    <div className="flex flex-wrap gap-6">
                      {onboardingQuestions.map((question, index) => (
                        <div key={index} className="border p-4 rounded-md">
                          <h3 className="font-bold">{question.question}</h3>
                          <p>Type: {question.type}</p>
                          <p>Required: {question.required ? "Yes" : "No"}</p>
                          <div className="mt-2 space-x-2">
                            <Button size="sm" onClick={() => handleEditOnboardingQuestion(index)}>
                              Edit
                            </Button>
                            <Button size="sm" intent="ghost" onClick={() => handleDeleteOnboardingQuestion(index)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
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

                <Button onClick={handleAddPromptModal} leftIcon={<Plus />}>
                  Add Prompt
                </Button>

                {/* Prompt Cards */}
                {prompts.length > 0 && (
                  <div className="mt-5">
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
                          <p>Time: {prompt.notificationConfig_startTime}</p>
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
              </div>

              <div className="mt-4">
                <Input
                  label="Configure custom protocol assignments for participants"
                  type="text"
                  size="lg"
                  fullWidth
                  placeholder="Enter Assginment Config (JSON)"
                  className="h-40  hidden"
                />

                <div className="flex flex-row items-center gap-2">
                  <Button
                    onClick={() => {
                      if (!assignmentConfig) {
                        setAssignmentConfig({
                          script: {
                            code: "",
                            inputs: [],
                            language: "python",
                          },
                          guid: crypto.randomUUID(),
                        });
                      }
                      setShowAssignmentEditor(true);
                    }}
                    leftIcon={<Pencil />}
                  >
                    {assignmentConfig ? "Edit Assignment" : "Create Assignment"}
                  </Button>

                  {assignmentConfig && (
                    <Button intent="danger_outlined" leftIcon={<Trash />} onClick={() => setAssignmentConfig(null)}>
                      Delete Assignment
                    </Button>
                  )}
                </div>

                {showAssignmentEditor && assignmentConfig && (
                  <div className="mt-2">
                    <AssignmentEditor
                      assignmentConfig={assignmentConfig}
                      isOpen={showAssignmentEditor}
                      onClose={(config: QuestAssignment) => {
                        console.log("config", config);
                        if (config.script.code === "") {
                          setAssignmentConfig(null);
                        } else {
                          setAssignmentConfig(config);
                        }
                        setShowAssignmentEditor(false);
                      }}
                      savedOnboardingQuestions={onboardingQuestions}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="mb-1 md:text-md block pl-1 text-sm font-semibold">
                  Choose health data types you want to collect
                </p>

                <div className="flex flex-row space-x-2">
                  {healthDataCategories.map((category) => (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category.value}
                        name={category.value}
                        className="text-primary-600 focus:ring-primary-500"
                        checked={healthDataConfig[category.value]}
                        onChange={handleHealthDataConfigChange}
                      />
                      <label htmlFor={category.value}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Include experiments you want people to run */}
              <div className="mt-5">
                <Input
                  label="Configure experiment you want people to run"
                  type="text"
                  size="lg"
                  fullWidth
                  placeholder="Enter Experiment Config (JSON)"
                  value={experimentConfig}
                  className="h-40  hidden"
                  onChange={(e) => setExperimentConfig(e.target.value)}
                />

                <div className="flex flex-row items-center gap-2">
                  <Button
                    onClick={() => {
                      setShowExperimentEditor(true);
                    }}
                    leftIcon={<Pencil />}
                  >
                    {experimentConfig ? "Edit Experiment" : "Create Experiment"}
                  </Button>

                  {experimentConfig && (
                    <Button intent="outlined" leftIcon={<Trash />} onClick={() => setExperimentConfig("")}>
                      Delete Experiment
                    </Button>
                  )}
                </div>

                {showExperimentEditor && (
                  <div className="mt-2">
                    <ExperimentEditor
                      experimentCode={experimentConfig}
                      setExperimentCode={setExperimentConfig}
                      isOpen={showExperimentEditor}
                      onClose={() => setShowExperimentEditor(false)}
                    />
                  </div>
                )}
              </div>

              {/* allow user to add a script (notebook) */}
              <div className="mt-5">
                <Input
                  label="Add a script (notebook) to run after data is collected"
                  type="text"
                  size="lg"
                  fullWidth
                  placeholder="Enter Script Config (JSON)"
                  value={scriptConfig}
                  className="h-40  hidden"
                  onChange={(e) => setScriptConfig(e.target.value)}
                />

                <div className="flex flex-row space-x-2">
                  <Button leftIcon={<Pencil />} onClick={() => setShowScriptEditor(true)}>
                    {scriptConfig ? "Edit Script (.py)" : "Add Script (.py)"}
                  </Button>

                  {scriptConfig && (
                    <Button intent="outlined" leftIcon={<Trash />} onClick={() => setScriptConfig("")}>
                      Delete Script
                    </Button>
                  )}

                  {showScriptEditor && (
                    <div className="mt-2">
                      <NotebookEditor
                        scriptCode={scriptConfig}
                        setScriptCode={setScriptConfig}
                        isOpen={showScriptEditor}
                        onClose={() => setShowScriptEditor(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <a
                    href="#"
                    className="underline"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdvancedQuestSettings(!showAdvancedQuestSettings);
                    }}
                  >
                    {showAdvancedQuestSettings ? "Hide Advanced Quest Settings" : "Show Advanced Quest Settings"}
                  </a>
                </div>

                {showAdvancedQuestSettings && (
                  <div className="mt-2 space-y-2">
                    <Input
                      label="Vital API Key"
                      type="text"
                      size="lg"
                      fullWidth
                      placeholder="Enter Vital API Key"
                      value={vitalApiKey}
                      onChange={(e) => setVitalApiKey(e.target.value)}
                      className="font-mono"
                    />

                    <Input
                      label="Vital Environment"
                      type="text"
                      size="lg"
                      placeholder="Enter Vital Environment"
                      value={vitalEnvironment}
                      onChange={(e) => setVitalEnvironment(e.target.value)}
                      className="font-mono"
                    />

                    <Input
                      label="Vital Region"
                      type="text"
                      size="lg"
                      placeholder="Enter Vital Region"
                      value={vitalRegion}
                      onChange={(e) => setVitalRegion(e.target.value)}
                      className="font-mono"
                    />

                    <Input
                      label="Gift Card Codes"
                      type="text"
                      size="lg"
                      placeholder="Enter Gift Card Codes (comma-separated)"
                      value={giftCardCodes}
                      onChange={(e) => setGiftCardCodes(e.target.value)}
                      className="font-mono"
                      fullWidth
                    />

                    <Input
                      label="Claimed Gift Card Codes"
                      type="text"
                      size="lg"
                      disabled
                      placeholder="Claimed Gift Card Codes"
                      value={giftCardCodesHistory}
                      className="font-mono"
                      fullWidth
                    />

                    <Button
                      onClick={async () => {
                        try {
                          if (!activeQuest) {
                            alert("You need to save the quest before you can apply the configuration");
                            return;
                          }

                          if (!vitalApiKey || !vitalEnvironment || !vitalRegion) {
                            alert("You need to fill in all the fields");
                            return;
                          }

                          const res = await api.post(
                            `/quest/config`,
                            {
                              questId: activeQuest.guid,
                              value: JSON.stringify({
                                vital_api_key: vitalApiKey,
                                vital_environment: vitalEnvironment,
                                vital_region: vitalRegion,
                                gift_card_codes: giftCardCodes,
                                gift_card_codes_history: giftCardCodesHistory,
                              }),
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${session.data?.user?.authToken}`,
                              },
                            }
                          );

                          console.log(res);
                          if (res.status === 200) {
                            alert("Configuration applied successfully");
                          } else {
                            alert("Failed to apply configuration");
                          }
                        } catch (e) {
                          alert("Invalid JSON configuration");
                        }
                      }}
                    >
                      Apply Configuration
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-row space-x-2"></div>
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
                leftIcon={<Save />}
              >
                {activeView === "edit" ? "Update Quest" : "Save Quest"}
              </Button>
            </div>
          </div>
        </>
      )}
      {activeView === "view" && (
        <>
          <p className="mb-5 mt-5 text-lg dark:text-slate-400">View all quests that you have created</p>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="w-[50%] px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {savedQuests.map((quest) => (
                  <tr key={quest.guid}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 truncate">
                      <Link href={`/quest/${quest.guid}`}>
                        <span className="underline">{quest.title}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="line-clamp-3 break-words">{quest.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex justify-end space-x-2">
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
                          className="underline"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Display Share Modal */}
      {activeQuest && (
        <ShareModal
          quest={activeQuest}
          displayShareModal={displayShareModal}
          setDisplayShareModal={setDisplayShareModal}
        />
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
          savedPrompts={prompts}
          savedOnboardingQuestions={onboardingQuestions}
        />
      )}

      {/* Onboarding Question Create/Edit Modal */}
      {activeOnboardingQuestion && (
        <AddOnboardingQuestionModal
          question={activeOnboardingQuestion}
          setQuestion={setActiveOnboardingQuestion}
          onSave={(question) => {
            setActiveOnboardingQuestion(question);

            if (editingOnboardingQuestionIndex !== null) {
              setOnboardingQuestions((prevQuestions) => {
                const updatedQuestions = [...prevQuestions];
                updatedQuestions[editingOnboardingQuestionIndex] = question;
                return updatedQuestions;
              });
            } else {
              setOnboardingQuestions((prevQuestions) => [...prevQuestions, question]);
            }
            setActiveOnboardingQuestion(null);
            setEditingOnboardingQuestionIndex(null);
          }}
          onClose={() => {
            setActiveOnboardingQuestion(null);
            setEditingOnboardingQuestionIndex(null);
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
