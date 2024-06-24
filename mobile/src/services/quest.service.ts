import dayjs from "dayjs";

import { Quest, Prompt, QuestPrompt } from "~/@types";
import { db } from "~/lib";
import { buildHealthDataset, getApiService } from "~/utils";

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
                  console.log("updating prompt");
                  // update prompt
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
                  // save prompt to db
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

  async fetchQuestPrompts(questId: string) {
    // fetch prompts for a quest - this will return any saved ones ..
    // vs. in the config
    try {
      const fetchPrompts = () =>
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

      const prompts = (await fetchPrompts()) ?? [];
      return prompts;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getSingleQuest(questId: string) {
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
                  quest.prompts = JSON.parse(quest.config!) as Prompt[];
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
    console.log("Quest is not saved locally, checking subscription status");
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
    // remove quest_prompts
    // remove prompt
    // remove quest
  }

  async uploadQuestDataset(questId: string) {
    // start from the current instant and do a dump
    const getHealthDataset = async () => {
      // get data from health service
      // build the health dataset
      try {
        const res = await buildHealthDataset(
          dayjs().startOf("day").subtract(1, "week"),
          dayjs()
        );

        if (res) {
          console.log("health dataset entries:", res.length);
          console.log("health data", JSON.stringify(res));
          return res;
        }
      } catch (error) {
        console.error("Failed to sync health data", error);
      }
    };
    const healthDataset = await getHealthDataset();

    const questPrompts = await this.fetchQuestPrompts(questId);
    const promptResponses = await Promise.all(
      questPrompts.map(async (questPrompt) => {
        // TODO: fetch the responses for each of the prompts
      })
    );

    // get the prompt responses
    // { prompt, responses[] }[]

    // upload the dataset
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
}

export const questService = new QuestService();
