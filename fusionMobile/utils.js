import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";
import * as Notifications from "expo-notifications";
import dayjs from "dayjs";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import appInsights from "./utils/appInsights";
import * as Updates from "expo-updates";

// this is where we create the context
export const PromptContext = React.createContext();

/**
 * Open the database
 * @returns {SQLite.WebSQLDatabase | SQLite.SQLiteDatabase}
 */
function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("fusion.db");
  return db;
}
export const db = openDatabase();

const createBaseTables = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // tx.executeSql(`DROP TABLE IF EXISTS prompt_responses;`);
      // tx.executeSql(`DROP TABLE IF EXISTS prompts;`);
      // tx.executeSql(`DROP TABLE IF EXISTS prompt_notifications;`);
      // tx.executeSql(`DELETE FROM prompt_responses;`);

      // Create prompts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS prompts (
            uuid TEXT PRIMARY KEY,
            promptText TEXT,
            responseType TEXT,
            notificationConfig_days TEXT,
            notificationConfig_startTime TEXT,
            notificationConfig_endTime TEXT,
            notificationConfig_countPerDay INTEGER
          );`,
        [],
        (tx, results) => {
          // Create prompt responses table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS prompt_responses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              promptUuid TEXT,
              triggerTimestamp INTEGER,
              responseTimestamp INTEGER,
              value TEXT,
              FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
            );`,
            [],
            (tx, results) => {
              // Create prompt notifications table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS prompt_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                promptUuid TEXT,
                notificationId TEXT,
                FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
              );`,
                [],
                (tx, results) => {
                  // finished creating all the tables
                  resolve(true);
                },
                (tx, error) => {
                  console.log("error", error);
                  reject(error);
                }
              );
            },
            (tx, error) => {
              console.log("error", error);
              reject(error);
            }
          );
        },
        (tx, error) => {
          console.log("error", error);
          reject(error);
        }
      );
    });
  });
};

export const PromptContextProvider = ({ children }) => {
  const [savedPrompts, setSavedPrompts] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const setupStatus = await createBaseTables();

      if (!setupStatus) {
        Alert.alert("Error", "There was an error setting up the app.");
      }

      const res = await readSavedPrompts();
      if (res) {
        setSavedPrompts(res);
      }
    })();
  }, []);

  return (
    <PromptContext.Provider value={{ savedPrompts, setSavedPrompts }}>
      {children}
    </PromptContext.Provider>
  );
};

export const readSavedPrompts = async () => {
  try {
    // get list of current prompts
    const fetchPrompts = () =>
      new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql("SELECT * FROM prompts", [], (_, { rows }) => {
            resolve(rows._array);
          });
        });
      });

    const prompts = await fetchPrompts();
    if (prompts) return prompts;
  } catch (e) {
    console.log("error reading prompts", e);
    return [];
  }
};

export const deletePrompt = async (uuid) => {
  try {
    // cancel the existing notifications for prompt
    await cancelExistingNotificationForPrompt(uuid);

    const deleteFromDb = () =>
      new Promise((resolve, reject) => {
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
    const prompts = await readSavedPrompts();
    return prompts;
  } catch (e) {
    // error reading value
    return null;
  }
};

export const savePrompt = async (
  promptText,
  responseType,
  countPerDay,
  startTime,
  endTime,
  days,
  uuid = null
) => {
  /**
   * Sets or saves a prompt to SQLite
   *
   * uuid - optional parameter to set the prompt UUID, when this is passed an existing prompt will be updated
   *
   */

  // TODO: better error handling with response
  if (
    !promptText ||
    !responseType ||
    !countPerDay ||
    !startTime ||
    !endTime ||
    !days
  ) {
    console.log("missing values");
    return null;
  }

  try {
    // build the prompt object
    const prompt = {
      uuid: uuid ? uuid : uuidv4(),
      promptText: promptText,
      responseType: responseType,
      notificationConfig_days: JSON.stringify(days),
      notificationConfig_startTime: startTime,
      notificationConfig_endTime: endTime,
      notificationConfig_countPerDay: countPerDay,
    };

    // TODO: check for prompt with duplicate name
    console.log("saving prompt", prompt);

    const saveToDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM prompts WHERE uuid = ?",
            [prompt.uuid],
            (_, { rows }) => {
              if (rows.length > 0) {
                console.log("updating prompt");
                // update prompt
                tx.executeSql(
                  `UPDATE prompts SET promptText = ?, responseType = ?, notificationConfig_days = ?, notificationConfig_startTime = ?, notificationConfig_endTime = ?, notificationConfig_countPerDay = ? WHERE uuid = ?`,
                  [
                    prompt.promptText,
                    prompt.responseType,
                    prompt.notificationConfig_days,
                    prompt.notificationConfig_startTime,
                    prompt.notificationConfig_endTime,
                    prompt.notificationConfig_countPerDay,
                    prompt.uuid,
                  ],
                  (_, { rows }) => {
                    console.log("prompt updated");
                    resolve(true);
                  },
                  (_, error) => {
                    console.log("error updating prompt", error);
                    reject(error);
                  }
                );
              } else {
                // save prompt to db
                tx.executeSql(
                  `INSERT INTO prompts (uuid, promptText, responseType, notificationConfig_days, notificationConfig_startTime, notificationConfig_endTime, notificationConfig_countPerDay) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    prompt.uuid,
                    prompt.promptText,
                    prompt.responseType,
                    prompt.notificationConfig_days,
                    prompt.notificationConfig_startTime,
                    prompt.notificationConfig_endTime,
                    prompt.notificationConfig_countPerDay,
                  ],
                  (_, { rows }) => {
                    console.log("prompt saved");
                    resolve(true);
                  },
                  (_, error) => {
                    reject(error);
                  }
                );
              }
            }
          );
        });
      });
    };

    const saveStatus = await saveToDb();
    if (saveStatus) {
      await scheduleFusionNotification(prompt);

      // app insights tracking
      appInsights.trackEvent(
        { name: "prompt_saved" },
        {
          identifier: await maskPromptId(prompt.uuid),
          action_type: uuid ? "update" : "create",
          response_type: prompt.responseType,
          notification_config: JSON.stringify({
            days: prompt.notificationConfig_days,
            start_time: prompt.notificationConfig_startTime,
            end_time: prompt.notificationConfig_endTime,
            count_per_day: prompt.notificationConfig_countPerDay,
          }),
        }
      );

      return true;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const scheduleFusionNotification = async (prompt) => {
  /**
   * Schedules a notification for a Fusion prompt
   *
   * - delete any existing notifications for this prompt
   * - check if all the days are selected.
   * - if yes, use DailyInputTrigger
   * - if no, loop through the days and use WeeklyInputTrigger
   * - save notificationId to sqlite
   * - update 'isScheuled' for prompt
   */

  // get the available times from date ranges.
  const availableTimes = getEvenlySpacedTimes(
    prompt.notificationConfig_startTime,
    prompt.notificationConfig_endTime,
    prompt.notificationConfig_countPerDay
  );

  let triggerObject = {};
  let contentObject = {
    title: `Fusion: ${prompt.promptText}`,
    categoryIdentifier: prompt.responseType,
  };
  // if platform is android assign channel
  if (Platform.OS === "android") {
    triggerObject["channelId"] = "default";
  }
  if (Platform.OS === "ios") {
    // apply notification instruction
    contentObject["body"] = "Press & hold to log";
  }

  const daysObject =
    typeof prompt.notificationConfig_days === "string"
      ? JSON.parse(prompt.notificationConfig_days)
      : prompt.notificationConfig_days;
  const dayToNumber = {
    sunday: 1,
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7,
  };

  try {
    // cancel existing notifications for prompt
    await cancelExistingNotificationForPrompt(prompt.uuid);

    console.log("availableTimes", availableTimes);

    for (let time of availableTimes) {
      const [hours, minutes] = time.split(":").map(Number);

      // loop through the days...
      const weekdays = Object.keys(daysObject).filter(
        (day) => daysObject[day] === true
      );

      if (weekdays.length == 7) {
        // schedule daily notification trigger
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: contentObject,
          trigger: {
            ...triggerObject,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });

        // save notificationId & promptId to db
        await saveNotificationIdForPrompt(notificationId, prompt.uuid);
      } else {
        for (let weekday of weekdays) {
          // schedule weekly notification trigger for every day selected
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: contentObject,
            trigger: {
              ...triggerObject,
              hour: hours,
              minute: minutes,
              repeats: true,
              weekday: dayToNumber[weekday],
            },
          });
          // save notificationId & promptId to db
          await saveNotificationIdForPrompt(notificationId, prompt.uuid);
        }
      }
    }
  } catch (e) {
    console.log("Unable to schedule notification");
    return false;
  }

  return true;
};

export const cancelExistingNotificationForPrompt = async (promptId) => {
  /**
   * Cancels the existing notification for a prompt
   * - get all the notificationIds for the prompt
   * - cancel all the notifications
   * - delete the notificationIds from the db
   */

  // now read from the db and cancel all the notifications
  try {
    const notificationIds = await getNotificationIdsForPrompt(promptId);
    for (let notificationId of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      // delete the notificationIds from the per id
      await deleteNotificationIdForPrompt(promptId, notificationId);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationIdsForPrompt = async (promptId) => {
  try {
    const getNotificationIdsFromDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT notificationId FROM prompt_notifications WHERE promptUuid = ?",
            [promptId],
            (_, { rows }) => {
              const notificationIds = rows._array.map(
                (row) => row.notificationId
              );
              resolve(notificationIds);
            },
            (_, error) => {
              console.log("error getting notificationIds from db");
              reject(error);
            }
          );
        });
      });
    };

    const notificationIds = await getNotificationIdsFromDb();
    return notificationIds;
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * Create prompt_notications entry in sqlite
 */
export const saveNotificationIdForPrompt = async (notificationId, promptId) => {
  try {
    const storeDetailsInDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO prompt_notifications (notificationId, promptUuid) VALUES (?, ?)",
            [notificationId, promptId],
            (_, { rows }) => {
              console.log("notificationId saved in db");
              resolve(true);
            },
            (_, error) => {
              console.log("error saving in db");
              reject(error);
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

export const deleteNotificationIdForPrompt = async (
  promptId,
  notificationId
) => {
  try {
    const deleteNotificationIdsFromDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "DELETE FROM prompt_notifications WHERE promptUuid = ? AND notificationId = ?",
            [promptId, notificationId],
            (_, { rows }) => {
              console.log("notificationIds deleted");
              resolve(true);
            },
            (_, error) => {
              console.log("error deleting notificationIds from db");
              reject(error);
            }
          );
        });
      });
    };

    await deleteNotificationIdsFromDb();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getPromptForNotificationId = async (notificationId) => {
  try {
    const getPromptFromDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT promptUuid FROM prompt_notifications WHERE notificationId = ? LIMIT 1",
            [notificationId],
            (_, { rows }) => {
              const promptUuid = rows._array[0].promptUuid;
              resolve(promptUuid);
            },
            (_, error) => {
              console.log("error getting promptUuid from db");
              reject(error);
            }
          );
        });
      });
    };

    const promptUuid = await getPromptFromDb();
    return promptUuid;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const savePromptResponse = async (responseObj) => {
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
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO prompt_responses (promptUuid, value, triggerTimestamp, responseTimestamp) VALUES (?, ?, ?, ?)",
            [
              responseObj["promptUuid"],
              responseObj["value"],
              responseObj["triggerTimestamp"],
              responseObj["responseTimestamp"],
            ],
            (_, { rows }) => {
              console.log("response saved");
              resolve(true);
            },
            (_, error) => {
              console.log("error saving in db");
              reject(error);
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

export const getPromptResponses = async (prompt) => {
  try {
    const getPromptResponsesFromDb = () => {
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM prompt_responses WHERE promptUuid = ?",
            [prompt.uuid],
            (_, { rows }) => {
              const responses = rows._array.map((row) => {
                return {
                  promptUuid: row.promptUuid,
                  value: row.value,
                  triggerTimestamp: row.triggerTimestamp,
                  responseTimestamp: row.responseTimestamp,
                };
              });
              resolve(responses);
            },
            (_, error) => {
              console.log("error getting responses from db");
              reject(error);
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

/**
 * Helper functions
 */
export const updateTimestampToMs = (unixTimestamp) => {
  /**
   * Converts unix timestamp to milliseconds
   */
  if (typeof unixTimestamp === "string") {
    unixTimestamp = parseInt(unixTimestamp);
  }
  if (unixTimestamp.toString().length === 10) {
    return unixTimestamp * 1000;
  }
  return unixTimestamp;
};

export const convertTime = (time24) => {
  /**
   * Converts 24 hour time to 12 hour time
   */
  let hour = parseInt(time24.substring(0, 2));
  let minute = time24.substring(3, 5);
  let suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};

function getEvenlySpacedTimes(startTime, endTime, count) {
  /**
   * Returns an array of (count) notifications based on available times
   */
  const start = getDayjsFromTimestring(startTime);
  const end = getDayjsFromTimestring(endTime);
  const max = parseInt(count) + 1;

  // Calculate the total duration between the two times in milliseconds
  const duration = end.diff(start);

  // Calculate the duration between each of the four evenly spaced times in milliseconds
  const interval = duration / max;

  // Calculate and display the four evenly spaced times between the start and end times
  const times = [];
  for (let i = 1; i < max; i++) {
    const time = start.add(interval * i);
    const timeString = time.format("HH:mm");
    times.push(timeString);
  }

  return times;
}

function padZero(num) {
  return num.toString().padStart(2, "0");
}

function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getDayjsFromTimestring(timeString) {
  // time is in the format "HH:mm", split up and convert to a dayjs object
  const time = timeString.split(":");
  const hour = parseInt(time[0]);
  const minute = parseInt(time[1]);

  return dayjs().startOf("day").add(hour, "hour").add(minute, "minute");
}

export async function maskPromptId(promptId) {
  /**
   * Basically takes a prompt ID and generates a hashed version to be stored for analytics.
   *
   */
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    promptId
  );

  return hash;
}

export async function fetchExistingPromptsForText(promptText) {
  // look in the sqlite db for the prompt
  // return the prompt info if it exists
  // return null if it doesn't exist
  try {
    const getPromptFromDb = () => {
      return new Promise((resolve, reject) => {
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
}

export async function resyncOldPrompts() {
  const oldPrompts = await AsyncStorage.getItem("prompts");
  if (oldPrompts) {
    /**
     * dismiss all notifications & cancel before migration
     */

    // getting the prompts that are in localstorage.
    const parsedPrompts = JSON.parse(oldPrompts);

    parsedPrompts.forEach(async (prompt) => {
      // if prompt doesn't have a uuid, generate one
      console.log("resyncing prompt - ", prompt.promptText);
      if (!prompt.uuid) {
        prompt.uuid = uuidv4(); // very unlikely but being defensive
      }

      // check the db if a prompt with the same name already exists if yes, skip
      const existingPrompts = await fetchExistingPromptsForText(
        prompt.promptText
      );
      const promptExists = existingPrompts.length > 0;

      let savePromptStatus;

      if (promptExists) {
        prompt.uuid = existingPrompts[0].uuid;
      } else {
        // create a new prompt in the db
        savePromptStatus = await savePrompt(
          prompt.promptText,
          prompt.responseType,
          3,
          "08:00",
          "18:00",
          {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          prompt.uuid
        );
      }

      if (savePromptStatus || promptExists) {
        // fetch old prompt responses and store in db
        const responses = await AsyncStorage.getItem("events");

        if (responses) {
          console.log("saving responses for - ", prompt.promptText);
          const parsedResponses = JSON.parse(responses);
          parsedResponses.forEach(async (response) => {
            console.log("evaluating, response name: ", response.event.name);
            if (response.event.name === `Fusion: ${prompt.promptText}`) {
              console.log("response name matches promptText");
              // save using the new flow
              const status = await savePromptResponse({
                promptUuid: prompt.uuid,
                triggerTimestamp: updateTimestampToMs(response.startTimestamp),
                responseTimestamp: updateTimestampToMs(response.startTimestamp),
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
      "Force close & restart the app if it doesn't happend automatically."
    );

    await Updates.reloadAsync();
  }
}
