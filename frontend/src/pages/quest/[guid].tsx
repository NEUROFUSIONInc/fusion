// this is what will contain the dashboard

import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { DashboardLayout, Meta } from "~/components/layouts";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "~/components/ui";
import React, { useCallback } from "react";
import { api } from "~/config";
import { useSession } from "next-auth/react";
import { DisplayCategory, FusionHealthDataset, FusionQuestDataset, IQuest } from "~/@types";
import { usePathname } from "next/navigation";
import { FusionLineChart } from "~/components/charts";
import dayjs from "dayjs";
import { ShareModal } from "~/components/quests";
import router from "next/router";

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
  const pathname = usePathname();
  const session = useSession();

  // get the last part of the pathname
  const questId = pathname.split("/").pop();

  const [questVitalApiKey, setQuestVitalApiKey] = React.useState<string>("");

  React.useEffect(() => {
    try {
      if (questId) {
        api
          .get(`/quest/config`, {
            params: {
              questId: questId,
            },
            headers: {
              Authorization: `Bearer ${session.data?.user?.authToken}`,
            },
          })
          .then((res) => {
            console.log("res", res);
            if (res.status === 200) {
              const parsedConfig = JSON.parse(res.data.value);
              setQuestVitalApiKey(parsedConfig.vital_api_key ?? "");
            }
          })
          .catch((e) => {
            console.error("Failed to fetch advanced quest config", e);
          });
      }
    } catch (e) {
      console.error("Failed to fetch advanced quest config", e);
    }
  }, [questId]);

  React.useEffect(() => {
    (async () => {
      const res = await api.get("/quest/editor-check", {
        params: { questId },
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

      if (res.status === 200) {
        if (!res.data.isEditor) {
          router.push(`/quests`);
        }
      }
    })();
  }, []);

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

  const [healthDatasets, setHealthDatasets] = React.useState<FusionQuestDataset[]>([]);
  const [questPromptResponses, setQuestPromptResponses] = React.useState<FusionQuestDataset[]>([]);
  const [questOnboardingResponses, setQuestOnboardingResponses] = React.useState<FusionQuestDataset[]>([]);
  const [displayTableView, setDisplayTableView] = React.useState(true);

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
      const healthDatasets = questDatasets
        .filter((dataset: any) => dataset.type === "health")
        .map((dataset: any) => {
          dataset.value = JSON.parse(dataset.value) as FusionHealthDataset[];
          return dataset;
        });

      console.log("updated quest object", questDatasets);

      if (questDatasets) {
        setHealthDatasets(healthDatasets);
      }

      // parse the prompt responses & onboarding responses
      const promptResponses = questDatasets.filter((dataset: any) => dataset.type === "prompt_responses");
      const onboardingResponses = questDatasets.filter((dataset: any) => dataset.type === "onboarding_responses");

      if (promptResponses) {
        setQuestPromptResponses(promptResponses);
      }
      if (onboardingResponses) {
        setQuestOnboardingResponses(onboardingResponses);
      }
    }
  }, [questId]);

  const [category, setCategory] = React.useState<DisplayCategory>(categories[0]);

  const [displayShareModal, setDisplayShareModal] = React.useState(false);

  const downloadCSV = async () => {
    try {
      // Combine all datasets
      const allDatasets: FusionQuestDataset[] = [
        ...healthDatasets,
        ...questPromptResponses,
        ...questOnboardingResponses,
      ];

      // Convert to CSV format
      const csvRows = [];

      // Add headers
      const headers = ["userGuid", "questGuid", "timestamp", "type", "value"];
      csvRows.push(headers.join(","));

      // Add data rows
      allDatasets.forEach((dataset) => {
        const row = [
          dataset.userGuid,
          dataset.questGuid,
          dataset.timestamp,
          dataset.type,
          // Properly escape value field for CSV format
          typeof dataset.value === "string"
            ? `"${dataset.value.replace(/"/g, '""')}"`
            : `"${JSON.stringify(dataset.value).replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      });

      // Create CSV content
      const csvContent = csvRows.join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `quest_${questId}_data.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };

  const getVitalUserMapping = async () => {
    try {
      const res = await api.get("/vital/quest/user-mapping", {
        params: {
          questId,
        },
        headers: {
          Authorization: `Bearer ${session.data?.user?.authToken}`,
        },
      });

      if (res.status === 200) {
        console.log("Vital user mapping fetched successfully");
        // Extract vital user mapping data
        const vitalUserMapping = res.data.vitalUserMapping || [];

        if (vitalUserMapping.length > 0) {
          // Create CSV content
          const csvRows = [];

          // Get headers dynamically from the first mapping object
          const headers = Object.keys(vitalUserMapping[0]);
          csvRows.push(headers.join(","));

          // Add data rows
          vitalUserMapping.forEach((mapping: Record<string, string>) => {
            const row = headers.map((header) => mapping[header]);
            csvRows.push(row.join(","));
          });

          // Create CSV content
          const csvContent = csvRows.join("\n");

          // Create blob and download
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `vital_user_mapping_${questId}.csv`);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        console.log(res.data);
      } else {
        console.error("Failed to fetch vital user mapping");
      }
    } catch (error) {
      console.error("Failed to get vital user mapping", error);
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
      </div>

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
        {/* <Button intent="primary" onClick={() => setDisplayTableView(true)}>
          Table View
        </Button> */}

        {displayTableView && (
          <>
            {/* <Button intent="primary" onClick={() => setDisplayTableView(false)}>
              Graph View
            </Button> */}
            <Button intent="primary" onClick={() => downloadCSV()}>
              Download Dataset
            </Button>
            {questVitalApiKey && (
              <Button intent="primary" onClick={() => getVitalUserMapping()}>
                Get Vital to Fusion User Mapping
              </Button>
            )}
          </>
        )}

        <Button className="" intent="primary" onClick={updateQuestDatasets}>
          Refresh
        </Button>
      </div>

      {/* dynamic content based on colelcted data */}
      <div className="mt-5">
        {/* category selection */}

        {/* display the graph */}
        {!displayTableView && healthDatasets && healthDatasets.length > 0 && (
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
                seriesData={healthDatasets}
                timePeriod="week"
                startDate={dayjs().startOf("day")}
                category={category}
              />
            </div>
          </>
        )}

        {displayTableView &&
          ((questPromptResponses && questPromptResponses.length > 0) ||
            (questOnboardingResponses && questOnboardingResponses.length > 0)) && (
            <>
              <h3 className="text-xl mb-2">Participant Responses</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Timestamp
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {[...(questPromptResponses || []), ...(questOnboardingResponses || [])].map((response, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {response.userGuid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {response.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {dayjs.unix(response.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {typeof response.value === "string" ? (
                            (() => {
                              try {
                                // Try to parse the string as JSON
                                const parsedJson = JSON.parse(response.value);
                                return (
                                  <div>
                                    <details className="cursor-pointer">
                                      <summary className="text-blue-500 hover:text-blue-700 font-medium">
                                        View data
                                      </summary>
                                      <pre className="whitespace-pre-wrap mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-96">
                                        {JSON.stringify(parsedJson, null, 2)}
                                      </pre>
                                    </details>
                                  </div>
                                );
                              } catch (e) {
                                // If it's not valid JSON, display the string directly
                                return response.value;
                              }
                            })()
                          ) : (
                            <div>
                              <details className="cursor-pointer">
                                <summary className="text-blue-500 hover:text-blue-700 font-medium">
                                  View JSON data
                                </summary>
                                <pre className="whitespace-pre-wrap mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-96">
                                  {JSON.stringify(response.value, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
