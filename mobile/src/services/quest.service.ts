import dayjs from "dayjs";

import { notificationService } from "./notification.service";
import { promptService } from "./prompt.service";

import {
  Quest,
  Prompt,
  QuestPrompt,
  OnboardingResponse,
  QuestAssignment,
} from "~/@types";
import { db } from "~/lib/db";
import { appInsights, buildHealthDataset, getApiService } from "~/utils";

class QuestService {
  async saveQuest(quest: Quest) {
    // save quest to db
    // if it contains the guid, update the quest
    try {
      const saveToDb = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM quests WHERE guid = ?",
              [quest.guid],
              (_, { rows }) => {
                if (rows.length > 0) {
                  console.log("updating quest");
                  tx.executeSql(
                    `UPDATE quests SET title = ?, description = ?, organizerName = ?, startTimestamp = ?, endTimestamp = ?, config = ? WHERE guid = ?`,
                    [
                      quest.title,
                      quest.description,
                      quest.organizerName,
                      quest.startTimestamp ?? null,
                      quest.endTimestamp ?? null,
                      quest.config ?? null,
                      quest.guid,
                    ],
                    () => {
                      console.log("quest updated");
                      resolve(true);
                    },
                    (_, error) => {
                      console.log("error updating quest", error);
                      reject(error);
                      return Boolean(error);
                    }
                  );
                } else {
                  // save quest to db
                  tx.executeSql(
                    `INSERT INTO quests (guid, title, description, organizerName, startTimestamp, endTimestamp, config ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                      quest.guid,
                      quest.title,
                      quest.description,
                      quest.organizerName,
                      quest.startTimestamp ?? null,
                      quest.endTimestamp ?? null,
                      quest.config ?? null,
                    ],
                    () => {
                      console.log("quest saved");
                      resolve(true);
                    },
                    (_, error) => {
                      reject(error);
                      return Boolean(error);
                    }
                  );
                }
              }
            );
          });
        });

      const saveStatus = await saveToDb();
      if (!saveStatus) {
        return false;
      }

      // for now adding prompts will be manual.
      return quest;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async fetchActiveQuests() {
    // fetch active quests from db
    try {
      const fetchQuests = () =>
        new Promise<Quest[]>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM quests",
              [],
              (_, { rows }) => {
                const quests = rows._array;
                if (quests.length > 0) {
                  quests.map((quest: Quest) => {
                    quest.prompts =
                      (JSON.parse(quest.config!) as Prompt[]) || [];
                  });
                }
                resolve(quests);
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });

      const quests = await fetchQuests();
      return quests;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async saveQuestPrompt(questId: string, promptId: string) {
    // add prompt to quest
    // find the quest in the db, save call save prompts in prompt.service
    // add quest_prompts entry in db
    try {
      // validate quest exists and then add to quest_prompts - if not present
      const saveToDb = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM quests WHERE guid = ?",
              [questId],
              (_, { rows }) => {
                if (rows.length > 0) {
                  const quest = rows._array[0] as Quest;

                  // save to quest_prompts
                  tx.executeSql(
                    `INSERT INTO quest_prompts (questId, promptId)
                    SELECT ?, ?
                    WHERE NOT EXISTS (
                      SELECT 1 FROM quest_prompts WHERE questId = ? AND promptId = ?
                    ) LIMIT 1`,
                    [questId, promptId, questId, promptId],
                    (_, { rowsAffected }) => {
                      if (rowsAffected > 0) {
                        console.log("quest prompt saved");
                        resolve(true);
                      } else {
                        console.log("quest prompt already exists");
                        resolve(false);
                      }
                    },
                    (_, error) => {
                      reject(error);
                      return Boolean(error);
                    }
                  );
                } else {
                  resolve(false);
                }
              }
            );
          });
        });

      const saveStatus = await saveToDb();
      return saveStatus;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async fetchQuestPromptDetails(questId: string) {
    // fetch prompts for a quest - this will return any saved ones ..
    // vs. in the config
    try {
      const queryDb = () =>
        new Promise<QuestPrompt[]>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `SELECT * FROM quest_prompts WHERE questId = ?`,
              [questId],
              (_, { rows }) => {
                const prompts = rows._array;
                resolve(prompts);
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });

      const questPrompts = await queryDb();

      if (questPrompts.length > 0) {
        // get the details for all the prompts
        const prompts = (
          await Promise.all(
            questPrompts.map((questPrompt) =>
              promptService.getPrompt(questPrompt.promptId)
            )
          )
        ).filter((prompt): prompt is Prompt => prompt !== null);

        return prompts;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getSingleQuestFromLocal(questId: string) {
    // fetch single quest by id
    try {
      const fetchQuest = () =>
        new Promise<Quest | null>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM quests WHERE guid = ?",
              [questId],
              (_, { rows }) => {
                const quest = rows._array[0] as Quest;
                if (quest) {
                  const configObject = JSON.parse(quest.config!);
                  quest.prompts = configObject?.prompts as Prompt[];
                  resolve(quest);
                } else {
                  resolve(null);
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });

      const quest = await fetchQuest();
      return quest;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async fetchRemoteSubscriptionStatus(questId: string) {
    try {
      const apiService = await getApiService();
      if (apiService === null) {
        throw new Error("Failed to get api service");
      }

      const response = await apiService.get(`/quest/userSubscription`, {
        params: {
          questId,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Subscription status", response.data);
        return response.data;
      } else {
        console.log(response.status);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteQuestPrompt(questId: string, promptId: string) {
    // remove prompt from quest
    // remove quest_prompts entry
    try {
      const deleteFromDb = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `DELETE FROM quest_prompts WHERE questId = ? AND promptId = ?`,
              [questId, promptId],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  console.log("quest prompt deleted");
                  resolve(true);
                } else {
                  console.log("quest prompt not found");
                  resolve(false);
                }
              },
              (_, error) => {
                reject(error);
                return Boolean(error);
              }
            );
          });
        });

      const deleteStatus = await deleteFromDb();
      return deleteStatus;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteQuest(questId: string) {
    // remove quest_prompts -> prompts -> quest_assignments -> quest
    try {
      const questPromptsDetails = await questService.fetchQuestPromptDetails(
        questId
      );
      // delete prompts
      await Promise.all(
        questPromptsDetails.map((prompt) =>
          promptService.deletePrompt(prompt.uuid)
        )
      );
      // delete quest_assignments
      await questService.cleanupQuestAssignments(questId);

      // delete quest
      const deleteQuest = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `DELETE FROM quests WHERE guid = ?`,
              [questId],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              }
            );
          });
        });

      const deleteStatus = await deleteQuest();
      return deleteStatus;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async uploadOnboardingResponses(
    questId: string,
    responses: OnboardingResponse[]
  ) {
    // upload to the api
    try {
      const apiService = await getApiService();
      const response = await apiService!.post(`/quest/dataset`, {
        questId,
        type: "onboarding_responses",
        value: responses,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Onboarding responses uploaded successfully");
        return true;
      } else {
        console.log("Failed to upload onboarding responses", response.status);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async uploadQuestPromptResponses(questId: string, promptId: string) {
    // upload the prompt responses
    // get the responses for the prompt
    // upload the responses
    const questPromptsDetails = await questService.fetchQuestPromptDetails(
      questId
    );

    const promptResponses = await Promise.all(
      questPromptsDetails.map(async (prompt) => {
        const res = await promptService.getPromptResponses(prompt.uuid);
        return { prompt, responses: res };
      })
    );

    try {
      const apiService = await getApiService();
      const response = await apiService!.post(`/quest/dataset`, {
        questId,
        type: "prompt_responses",
        value: promptResponses,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Prompt responses uploaded successfully");
        return true;
      } else {
        console.log("Failed to upload prompt responses", response.status);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      appInsights.trackEvent({
        name: "quest_prompt_response_upload_triggered",
        properties: {
          questId,
          promptId,
        },
      });
    }
  }

  async uploadQuestDataset(questId: string) {
    /**
     * 1. get the health dataset
     * 2. get the prompt responses
     * 3. upload the dataset
     *
     * Lookback for updating health data is one week
     */
    const getHealthDataset = async () => {
      // get data from health service
      // build the health dataset
      try {
        const res = await buildHealthDataset(
          dayjs().startOf("day").subtract(1, "week"),
          dayjs()
        );

        if (res) {
          return res;
        }
      } catch (error) {
        console.error("Failed to sync health data", error);
      }
    };
    const healthDataset = await getHealthDataset();

    // upload the health dataset
    try {
      const apiService = await getApiService();
      const response = await apiService!.post(`/quest/dataset`, {
        questId,
        type: "health",
        value: healthDataset,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Dataset uploaded successfully");
        return true;
      } else {
        console.log("Failed to upload dataset", response.status);
        return false;
      }
    } catch (error) {
      console.error("Failed to upload dataset", error);
      return false;
    }
  }

  async getMissedPrompts(questId: string) {
    const questPromptsDetails = await questService.fetchQuestPromptDetails(
      questId
    );

    const missedQuestPrompts = (
      await promptService.getMissedPromptsToday()
    ).filter((prompt) =>
      questPromptsDetails.some((qp) => qp.uuid === prompt.uuid)
    );

    // from this return the quest
    return missedQuestPrompts;
  }

  async hasQuestChanged(savedQuest: Quest, remoteQuest: Quest) {
    if (savedQuest.title !== remoteQuest.title) {
      return true;
    }

    if (savedQuest.description !== remoteQuest.description) {
      return true;
    }

    if (savedQuest.organizerName !== remoteQuest.organizerName) {
      return true;
    }

    // now let's check the config
    if (savedQuest.config !== remoteQuest.config) {
      return true;
    }

    return false;
  }

  async fetchAssignments(questId: string) {
    try {
      // Check if assignments already exist
      const existingAssignments = await this.getAllAssignments(questId);
      if (existingAssignments.length > 0) {
        return existingAssignments;
      }

      console.log("Fetching assignments for quest from api", questId);

      const apiService = await getApiService();
      if (!apiService) return null;
      const response = await apiService.get(`/quest/assignments`, {
        params: { questId },
      });

      if (response.status === 200 && response.data) {
        const assignments = response.data.split("\n").filter(Boolean);
        const now = dayjs().startOf("day");

        // Get quest details for notification title
        const quest = await this.getSingleQuestFromLocal(questId);
        if (!quest) return null;

        // Create assignments with timestamps for each day
        const assignmentData: QuestAssignment[] = assignments.map(
          (assignment: string, index: number) => {
            const [timeStr, ...assignmentParts] = assignment
              .split(";")
              .map((s) => s.trim());
            const timestamp = now.add(index, "day");
            const [hours, minutes] = timeStr.match(/\d{2}/g) || ["09", "00"];

            return {
              questId,
              timestamp: timestamp
                .hour(parseInt(hours, 10))
                .minute(parseInt(minutes, 10))
                .valueOf(),
              assignment: assignmentParts.join(";").trim(),
            };
          }
        );

        await this.saveAssignments(assignmentData);
        await this.scheduleAssignmentNotifications(assignmentData, quest.title);

        return assignmentData;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch assignment", error);
      return null;
    }
  }

  async saveAssignments(assignments: QuestAssignment[]) {
    if (!assignments.length) return false;

    try {
      await questService.cleanupQuestAssignments(assignments[0].questId);

      await new Promise<void>((resolve, reject) => {
        db.transaction((tx) => {
          const query = `INSERT INTO quest_assignments (questId, timestamp, assignment) VALUES ${assignments
            .map(() => "(?, ?, ?)")
            .join(", ")}`;

          const values = assignments.flatMap((assignment) => [
            assignment.questId,
            assignment.timestamp,
            assignment.assignment,
          ]);

          tx.executeSql(
            query,
            values,
            () => resolve(),
            (_, error) => {
              console.error("Error saving assignments:", error);
              reject(error);
              return false;
            }
          );
        });
      });

      return true;
    } catch (error) {
      console.error("Failed to save assignments:", error);
      return false;
    }
  }

  async getTodayAssignment(questId: string): Promise<string | null> {
    return new Promise((resolve) => {
      const startOfDay = dayjs().startOf("day").valueOf();
      const endOfDay = dayjs().endOf("day").valueOf();

      db.transaction((tx) => {
        tx.executeSql(
          "SELECT assignment FROM quest_assignments WHERE questId = ? AND timestamp >= ? AND timestamp < ? LIMIT 1",
          [questId, startOfDay, endOfDay],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0).assignment);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error("Error getting today's assignment:", error);
            resolve(null);
            return true;
          }
        );
      });
    });
  }

  async getAllAssignments(questId: string): Promise<QuestAssignment[]> {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM quest_assignments WHERE questId = ? ORDER BY timestamp ASC",
          [questId],
          (_, result) => {
            const assignments: QuestAssignment[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              assignments.push(result.rows.item(i));
            }
            resolve(assignments);
          },
          (_, error) => {
            console.error("Error getting assignments:", error);
            resolve([]);
            return true;
          }
        );
      });
    });
  }

  private async scheduleAssignmentNotifications(
    assignments: QuestAssignment[],
    questTitle: string
  ) {
    try {
      for (const assignment of assignments) {
        const notificationTime = dayjs(assignment.timestamp);
        const notificationId = `quest-${assignment.questId}-${assignment.timestamp}`;

        // Only schedule if it's in the future
        if (notificationTime.isAfter(dayjs())) {
          await notificationService.scheduleOneTimeNotification({
            id: notificationId,
            title: questTitle,
            body: assignment.assignment,
            timestamp: notificationTime.valueOf(),
          });
        }
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  async cleanupQuestAssignments(questId: string) {
    try {
      // Get all notification IDs for this quest
      const assignments = await this.getAllAssignments(questId);

      // Cancel all notifications
      for (const assignment of assignments) {
        const notificationId = `quest-${assignment.questId}-${assignment.timestamp}`;
        await notificationService.cancelOneTimeNotification(notificationId);
      }

      // Delete assignments from local DB
      await this.deleteQuestAssignments(questId);

      return true;
    } catch (error) {
      console.error("Error cleaning up assignments:", error);
      return false;
    }
  }

  private async deleteQuestAssignments(questId: string) {
    return new Promise<boolean>((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM quest_assignments WHERE questId = ?",
          [questId],
          () => {
            resolve(true);
          },
          (_, error) => {
            console.error("Error deleting assignments:", error);
            resolve(false);
            return true;
          }
        );
      });
    });
  }
}

export const questService = new QuestService();
