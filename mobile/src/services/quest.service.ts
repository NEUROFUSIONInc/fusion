import { Quest, Prompt } from "~/@types";
import { db } from "~/lib";

class QuestService {
  async saveQuest(quest: Quest) {
    // save quest to db
    // if it contains the guid, update the quest
    try {
      const saveToDb = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompts WHERE uuid = ?",
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

      return true;
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

  async saveQuestPrompt(questId: string, prompt: Prompt) {
    // add prompt to quest
    // find the quest in the db, save call save prompts in prompt.service
    // add quest_prompts entry in db
  }

  async fetchQuestPrompts(questId: string) {
    // fetch prompts for a quest - this will return any saved ones ..
    // vs. in the config
  }
}

export const questService = new QuestService();
