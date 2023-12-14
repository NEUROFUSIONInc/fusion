import dayjs from "dayjs";
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
} from "~/@types";
import { db } from "~/lib";
import {
  appInsights,
  getEvenlySpacedTimes,
  maskPromptId,
  updateTimestampToMs,
} from "~/utils";

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

        // TODO: include userNpub
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

  public getPromptResponses = async (
    promptUuid: string,
    startTimestamp: number = -1,
    endTimestamp: number = -1
  ) => {
    try {
      let queryString = "SELECT * FROM prompt_responses WHERE promptUuid = ?";
      const queryParams: (string | number)[] = [promptUuid];
      if (startTimestamp > 0) {
        queryString += " AND responseTimestamp >= ?";
        queryParams.push(startTimestamp);
      }
      if (endTimestamp > 0) {
        queryString += " AND responseTimestamp <= ?";
        queryParams.push(endTimestamp);
      }
      const getPromptResponsesFromDb = () => {
        return new Promise<PromptResponse[]>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              queryString,
              queryParams,
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

  /**
   * This is the hackiest function in the codebase & it's held
   * together by duct tape and prayers. We will deprecte it once we
   * start logging when notifications are triggered and when they are
   * responded to.
   */
  public getMissedPromptsToday = async () => {
    // get all prompts that have been missed since the timestamp
    // make sure prompts are also active
    const prompts = await this.readSavedPrompts();
    const missedPrompts: Prompt[] = [];

    for (const prompt of prompts) {
      // if notification is not active, skip
      if (
        !prompt.additionalMeta ||
        prompt.additionalMeta?.isNotificationActive === false
      ) {
        continue;
      }

      // if notification is not supposed to come up on the current day, skip
      const daysObject =
        typeof prompt.notificationConfig_days === "string"
          ? (JSON.parse(
              prompt.notificationConfig_days
            ) as NotificationConfigDays)
          : prompt.notificationConfig_days;
      const activeDays = Object.entries(daysObject)
        .filter(([day, value]) => value)
        .map(([day, value]) => day);

      // find the days in string between sinceTimestamp and currentTimestamp
      if (
        !activeDays.includes(
          dayjs().startOf("day").format("dddd").toLowerCase()
        )
      ) {
        console.log("skipping prompt because it's not active today");
        continue;
      }

      const responses = await this.getPromptResponses(
        prompt.uuid,
        dayjs().startOf("day").unix() * 1000
      );

      if (responses.length === prompt.notificationConfig_countPerDay) {
        console.log("skipping prompt because it's already been answered today");
        continue;
      }

      console.log("prompt is active today, fetching missed times");

      // check the times we expected notifications to be triggered
      const notificationTimes = getEvenlySpacedTimes(
        prompt.notificationConfig_startTime,
        prompt.notificationConfig_endTime,
        prompt.notificationConfig_countPerDay
      );

      // get which times have actually been triggered
      const triggeredNotificationTimes = [];
      for (let i = 0; i < notificationTimes.length; i++) {
        const [hours, minutes] = notificationTimes[i].split(":").map(Number);
        const notificationTimestamp =
          dayjs()
            .startOf("day")
            .add(hours, "hour")
            .add(minutes, "minute")
            .unix() * 1000;

        if (notificationTimestamp <= dayjs().unix() * 1000) {
          triggeredNotificationTimes.push(notificationTimestamp);
        }
      }

      // if triggeredTimes < responseTimes, and the person has
      // not responded "lately" then add to missedPrompts
      if (triggeredNotificationTimes.length > responses.length) {
        /**
         * If the gap in responses is more than 1 missed prompt,
         * - find interval between
         * - the client time & the last response
         * If the interval is greater than min. prompt interval then show it.. if not, skip
         * currently the min.prompt interval is 30 minutes
         */
        if (responses.length > 0) {
          const lastResponseTimestamp =
            responses[responses.length - 1].responseTimestamp;

          const interval = dayjs().diff(dayjs(lastResponseTimestamp), "minute");
          if (interval < 30) {
            console.log("skipping prompt because it's not been long enough");
            continue;
          }
        }

        missedPrompts.push(prompt);
      }
    }
    return missedPrompts;
  };

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

  /**
   * Reset all prompt notifications
   */
  public resetNotificationsForActivePrompts = async () => {
    // get savedPromptIds from db
    try {
      const savedPrompts = await promptService.readSavedPrompts();

      savedPrompts.forEach(async (prompt) => {
        // if prompt is scheduled, schedule it again
        if (prompt.additionalMeta?.isNotificationActive === false) {
          return;
        }
        await notificationService.cancelExistingNotificationForPrompt(
          prompt.uuid
        );
        await notificationService.scheduleFusionNotification(prompt);
      });
    } catch (error) {
      console.log("error resetting device notifications", error);
    }
  };
}

export const promptService = new PromptService(notificationService);
