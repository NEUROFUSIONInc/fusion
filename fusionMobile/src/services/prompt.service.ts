import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";

import {
  NotificationService,
  notificationService,
} from "./notification.service";

import {
  CreatePrompt,
  NotificationConfigDays,
  Prompt,
  PromptAdditionalMeta,
  PromptResponse,
  PromptResponseWithEvent,
} from "~/@types";
import { db } from "~/lib";
import { appInsights, maskPromptId, updateTimestampToMs } from "~/utils";

class PromptService {
  constructor(private readonly notificationService: NotificationService) {}

  public readSavedPrompts = async () => {
    try {
      // get list of current prompts
      const fetchPrompts = () =>
        new Promise<Prompt[]>((resolve) => {
          db.transaction((tx) => {
            tx.executeSql("SELECT * FROM prompts", [], (_, { rows }) => {
              // format all elements in the array to prompt object type before retruning
              resolve(
                rows._array.map((row) => {
                  return {
                    uuid: row.uuid,
                    promptText: row.promptText,
                    responseType: row.responseType,
                    notificationConfig_days: JSON.parse(
                      row.notificationConfig_days
                    ) as NotificationConfigDays,
                    notificationConfig_startTime:
                      row.notificationConfig_startTime,
                    notificationConfig_endTime: row.notificationConfig_endTime,
                    notificationConfig_countPerDay:
                      row.notificationConfig_countPerDay,
                    additionalMeta: row.additionalMeta
                      ? (JSON.parse(row.additionalMeta) as PromptAdditionalMeta)
                      : row.additionalMeta,
                  };
                })
              );
            });
          });
        });

      const prompts = await fetchPrompts();
      return prompts;
    } catch (e) {
      console.log("error reading prompts", e);
      throw new Error("error reading prompts");
    }
  };

  public getPrompt = async (promptUuid: string) => {
    try {
      const getPromptFromDb = () => {
        return new Promise<Prompt | null>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompts WHERE uuid = ?",
              [promptUuid],
              (_, { rows }) => {
                const prompts = rows._array.map((row) => {
                  return {
                    uuid: row.uuid,
                    promptText: row.promptText,
                    responseType: row.responseType,
                    notificationConfig_days: JSON.parse(
                      row.notificationConfig_days
                    ) as NotificationConfigDays,
                    notificationConfig_startTime:
                      row.notificationConfig_startTime,
                    notificationConfig_endTime: row.notificationConfig_endTime,
                    notificationConfig_countPerDay:
                      row.notificationConfig_countPerDay,
                    additionalMeta: row.additionalMeta
                      ? (JSON.parse(row.additionalMeta) as PromptAdditionalMeta)
                      : row.additionalMeta,
                  };
                });

                if (prompts.length > 0) {
                  const prompt = prompts[0];
                  resolve(prompt);
                } else {
                  console.log("prompt lengeth is zero");
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
      };

      const prompt = await getPromptFromDb();
      return prompt;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public fetchExistingPromptsForText = async (promptText: string) => {
    // look in the sqlite db for the prompt
    // return the prompt info if it exists
    // return null if it doesn't exist
    try {
      const getPromptFromDb = () => {
        return new Promise<
          {
            uuid: string;
          }[]
        >((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompts WHERE promptText = ?",
              [promptText],
              (_, { rows }) => {
                const prompt = rows._array.map((row) => {
                  return {
                    uuid: row.uuid,
                  };
                });
                resolve(prompt);
              },
              (_, error) => {
                console.log("error getting prompt from db");
                reject(error);
                return false;
              }
            );
          });
        });
      };

      const prompt = await getPromptFromDb();
      return prompt;
    } catch (error) {
      console.log(error);
    }
  };

  public deletePrompt = async (uuid: string) => {
    try {
      // cancel the existing notifications for prompt
      await this.notificationService.cancelExistingNotificationForPrompt(uuid);

      // check if prompt exists
      const exists = await this.promptExists(uuid);
      if (!exists) {
        throw new Error("prompt does not exist");
      }

      const deleteFromDb = () =>
        new Promise((resolve) => {
          db.transaction((tx) => {
            tx.executeSql(
              `DELETE FROM prompts WHERE uuid = ?`,
              [uuid],
              (_, { rows }) => {
                resolve(rows._array);
              }
            );
          });
        });

      await deleteFromDb();

      // get list of current prompts
      const prompts = await this.readSavedPrompts();
      return prompts;
    } catch (e) {
      // error reading value
      console.log("error deleting prompt", e);
      throw new Error("error deleting prompt");
    }
  };

  public savePrompt = async (promptEntry: CreatePrompt) => {
    /**
     * Takes save prompt to sqlite db
     * If isNotification is false, don't schedule the notification
     *  - by default it doens't matter, the value could be undefined
     */
    const prompt = {
      ...promptEntry,
      uuid: promptEntry.uuid ?? uuidv4(),
    };

    try {
      const saveToDb = () =>
        new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompts WHERE uuid = ?",
              [prompt.uuid],
              (_, { rows }) => {
                if (rows.length > 0) {
                  console.log("updating prompt");
                  // update prompt
                  tx.executeSql(
                    `UPDATE prompts SET promptText = ?, responseType = ?, additionalMeta= ?, notificationConfig_days = ?, notificationConfig_startTime = ?, notificationConfig_endTime = ?, notificationConfig_countPerDay = ? WHERE uuid = ?`,
                    [
                      prompt.promptText,
                      prompt.responseType,
                      JSON.stringify(prompt.additionalMeta),
                      JSON.stringify(prompt.notificationConfig_days),
                      prompt.notificationConfig_startTime,
                      prompt.notificationConfig_endTime,
                      prompt.notificationConfig_countPerDay,
                      prompt.uuid,
                    ],
                    () => {
                      console.log("prompt updated");
                      resolve(true);
                    },
                    (_, error) => {
                      console.log("error updating prompt", error);
                      reject(error);
                      return Boolean(error);
                    }
                  );
                } else {
                  // save prompt to db
                  tx.executeSql(
                    `INSERT INTO prompts (uuid, promptText, responseType, additionalMeta, notificationConfig_days, notificationConfig_startTime, notificationConfig_endTime, notificationConfig_countPerDay) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      prompt.uuid,
                      prompt.promptText,
                      prompt.responseType,
                      JSON.stringify(prompt.additionalMeta),
                      JSON.stringify(prompt.notificationConfig_days),
                      prompt.notificationConfig_startTime,
                      prompt.notificationConfig_endTime,
                      prompt.notificationConfig_countPerDay,
                    ],
                    () => {
                      console.log("prompt saved");
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
      if (saveStatus) {
        let isNotificationActive = true;
        if (prompt.additionalMeta) {
          if (prompt.additionalMeta["isNotificationActive"] === false) {
            isNotificationActive = false;
            await this.notificationService.cancelExistingNotificationForPrompt(
              prompt.uuid
            );
          }
        }

        if (isNotificationActive) {
          await this.notificationService.scheduleFusionNotification(prompt);
        }

        // app insights tracking
        appInsights.trackEvent(
          { name: "prompt_saved" },
          {
            identifier: await maskPromptId(prompt.uuid),
            action_type: promptEntry.uuid ? "update" : "create",
            response_type: prompt.responseType,
            notification_config: JSON.stringify({
              days: prompt.notificationConfig_days,
              start_time: prompt.notificationConfig_startTime,
              end_time: prompt.notificationConfig_endTime,
              count_per_day: prompt.notificationConfig_countPerDay,
            }),
            extras: JSON.stringify({
              isNotificationActive: prompt.additionalMeta?.isNotificationActive,
              category: prompt.additionalMeta?.category,
            }),
          }
        );

        return prompt;
      }
    } catch (e) {
      // error reading value
      console.log("error saving prompt", e);
      // throw new Error("error saving prompt");
    }
  };

  savePromptResponse = async (responseObj: PromptResponse) => {
    // ensure timestamp columns are in unixTime milliseconds
    responseObj["triggerTimestamp"] = updateTimestampToMs(
      responseObj["triggerTimestamp"]
    );
    responseObj["responseTimestamp"] = updateTimestampToMs(
      responseObj["responseTimestamp"]
    );

    // write to sqlite
    try {
      const storeDetailsInDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "INSERT INTO prompt_responses (promptUuid, value, triggerTimestamp, responseTimestamp, additionalMeta) VALUES (?, ?, ?, ?, ?);",
              [
                responseObj["promptUuid"],
                responseObj["value"],
                responseObj["triggerTimestamp"],
                responseObj["responseTimestamp"],
                JSON.stringify(responseObj.additionalMeta ?? {}),
              ],
              () => {
                //
                resolve(true);
              },
              (_, error) => {
                console.log("error saving in db");
                reject(error);
                return false;
              }
            );
          });
        });
      };

      await storeDetailsInDb();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  public getPromptResponses = async (promptUuid: string) => {
    try {
      const getPromptResponsesFromDb = () => {
        return new Promise<PromptResponse[]>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompt_responses WHERE promptUuid = ?",
              [promptUuid],
              (_, { rows }) => {
                const responses = rows._array.map((row) => {
                  return {
                    promptUuid: row.promptUuid,
                    value: row.value,
                    triggerTimestamp: row.triggerTimestamp,
                    responseTimestamp: row.responseTimestamp,
                    additionalMeta: JSON.parse(row.additionalMeta ?? "{}"),
                  } as PromptResponse;
                });
                resolve(responses);
              },
              (_, error) => {
                console.log("error getting responses from db");
                reject(error);
                return false;
              }
            );
          });
        });
      };

      const responses = await getPromptResponsesFromDb();
      return responses;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  private promptExists = async (uuid: string) => {
    try {
      const promptExists = () =>
        new Promise<boolean>((resolve) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM prompts WHERE uuid = ?",
              [uuid],
              (_, { rows }) => {
                resolve(rows._array.length > 0);
              }
            );
          });
        });

      const exists = await promptExists();
      return exists;
    } catch (e) {
      // error reading value
      console.log("error reading prompt", e);
      return false;
    }
  };

  async resyncOldPrompts() {
    const oldPrompts = await AsyncStorage.getItem("prompts");
    if (oldPrompts) {
      /**
       * dismiss all notifications & cancel before migration
       */

      // getting the prompts that are in local storage.
      const parsedPrompts = JSON.parse(oldPrompts) as Prompt[];

      parsedPrompts.forEach(async (prompt) => {
        // if prompt doesn't have a uuid, generate one
        console.log("resyncing prompt - ", prompt.promptText);
        if (!prompt.uuid) {
          prompt.uuid = uuidv4(); // very unlikely but being defensive
        }

        // check the db if a prompt with the same name already exists if yes, skip
        const existingPrompts = await this.fetchExistingPromptsForText(
          prompt.promptText
        );
        const promptExists = existingPrompts && existingPrompts.length > 0;

        let savePromptStatus;

        if (promptExists) {
          prompt.uuid = existingPrompts[0].uuid;
        } else {
          // create a new prompt in the db
          savePromptStatus = await this.savePrompt({
            ...prompt,
            notificationConfig_countPerDay: 3,
            notificationConfig_startTime: "08:00",
            notificationConfig_endTime: "18:00",
            notificationConfig_days: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          });
        }

        if (savePromptStatus || promptExists) {
          // fetch old prompt responses and store in db
          const responses = await AsyncStorage.getItem("events");

          if (responses) {
            console.log("saving responses for - ", prompt.promptText);
            const parsedResponses = JSON.parse(
              responses
            ) as PromptResponseWithEvent[];
            parsedResponses.forEach(async (response) => {
              console.log("evaluating, response name: ", response.event.name);
              if (response.event.name === `Fusion: ${prompt.promptText}`) {
                console.log("response name matches promptText");
                // save using the new flow
                const status = await this.savePromptResponse({
                  promptUuid: prompt.uuid,
                  triggerTimestamp: updateTimestampToMs(
                    response.startTimestamp
                  ),
                  responseTimestamp: updateTimestampToMs(
                    response.startTimestamp
                  ),
                  value: response.event.value,
                });
                if (status) {
                  console.log("save response status: ", status);
                }
              }
            });
          }
        }
      });

      Alert.alert(
        "Prompts & Responses Synced",
        "Force close & restart the app if it doesn't happened automatically."
      );

      appInsights.trackEvent(
        {
          name: "resyncOldPrompts",
        },
        {
          promptCount: parsedPrompts.length,
        }
      );

      await Updates.reloadAsync();
    }
  }

  public processPromptResponses = async (
    prompts: Prompt[],
    combinedResponses: PromptResponse[]
  ) => {
    /**
     * This function takes in an array of prompts and
     * returns an array of prompt responses
     */
    // map array to promises
    const combiningResponses = prompts.map(async (prompt) => {
      // your processing code here
      const responses = await promptService.getPromptResponses(prompt.uuid);
      combinedResponses.push(...responses);
    });

    await Promise.all(combiningResponses);

    // mask the prompt uuids
    const formatResponseInfo = combinedResponses.map(async (response) => {
      response.promptUuid = await maskPromptId(response.promptUuid);
      response.additionalMeta = JSON.stringify(response.additionalMeta);
    });

    await Promise.all(formatResponseInfo);

    return combinedResponses;
  };

  public updatePromptNotificationState = async ({
    promptUuid,
    isNotificationActive,
  }: {
    promptUuid: string;
    isNotificationActive: boolean;
  }) => {
    const prompt = await this.getPrompt(promptUuid);

    if (!prompt) {
      return;
    }

    if (!prompt.additionalMeta) {
      prompt.additionalMeta = {};
    }
    prompt.additionalMeta["isNotificationActive"] = isNotificationActive;

    // save prompt, add option to disable notifications
    const res = await this.savePrompt(prompt);
    return res;
  };
}

export const promptService = new PromptService(notificationService);
