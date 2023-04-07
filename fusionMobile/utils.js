import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";
import * as Notifications from "expo-notifications";

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

export const PromptContextProvider = ({ children }) => {
  const [savedPrompts, setSavedPrompts] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const res = await readSavedPrompts();
      if (res) {
        setSavedPrompts(res);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!savedPrompts) {
      return;
    }

    let scheduledNotifications;
    (async () => {
      scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log("scheduled notifications", scheduledNotifications);

      // TODO: Migration
      // when an exsiting user connects, their scheduled notifications will be listed
      // we will:
      // - generate a prompt from the existing notification structure
      // - delete the existing notification
      // - schedule notification for the new prompt

      // TODO: switch this to check with prompt notifications in the db.
      // and if they're scheduled..
      // identifier === notificationId
      // currently this will always be true
      savedPrompts.forEach(async (prompt) => {
        const notification = scheduledNotifications.find(
          (n) => n.identifier === prompt.uuid
        );
        if (!notification) {
          console.log("scheduling notification for prompt", prompt);
          await scheduleFusionNotification(prompt);
        }
      });
    })();
  }, [savedPrompts]);

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
  } catch (error) {
    console.log(error);
    return null;
  }
};

function getEvenlySpacedTimes(startTime, endTime, count) {
  /**
   * Returns an array of (count) notifications based on available times
   */
  const start = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);
  const totalMinutes = end - start;

  // we're adding 1 so we can skip the first and last times
  const interval = totalMinutes / (count + 1);

  const times = [];
  for (let i = 1; i < count + 1; i++) {
    const timeInMinutes = start + i * interval;
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    const timeString = `${padZero(hours)}:${padZero(minutes)}`;
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

export const scheduleFusionNotification = async (prompt) => {
  /**
   * Schedules a notification for a Fusion prompt
   *
   * - delete any existing notifications for this prompt
   * - check if all the days are selected.
   * - if yes, use DailyInputTrigger
   * - if no, loop through the days and use WeeklyInputTrigger
   * - save notificationId to sqlite
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
    // cancel existing notification
    await cancelExistingNotificationForPrompt(prompt.uuid);

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
          // schedule weekly notification trigger
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

/**
 * CRUD for notificationId & promptId to sqlite
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
              console.log("notificationId saved");
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

export const cancelExistingNotificationForPrompt = async (promptId) => {
  /**
   * Cancels the existing notification for a prompt
   * - get all the notificationIds for the prompt
   * - cancel all the notifications
   * - delete the notificationIds from the db
   */

  // support the old way... when we used promptId as notificationId
  await Notifications.cancelScheduledNotificationAsync(promptId);

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

const updateTimestampToMs = (unixTimestamp) => {
  if (unixTimestamp.length === 10) {
    return unixTimestamp * 1000;
  }
  return unixTimestamp;
};

export const saveFusionEvent = async (eventObj) => {
  // ensure timestamp columns are in unixTime milliseconds

  eventObj["startTimestamp"] = updateTimestampToMs(eventObj["startTimestamp"]);
  eventObj["endTimestamp"] = updateTimestampToMs(eventObj["endTimestamp"]);

  // first fetch events in local storage
  try {
    const events = await AsyncStorage.getItem("events");
    if (events !== null) {
      // value previously stored
      const eventArray = JSON.parse(events);
      eventArray.push(eventObj);
      await AsyncStorage.setItem("events", JSON.stringify(eventArray));
      return eventArray;
    } else {
      const newEvents = [];
      newEvents.push(eventObj);
      await AsyncStorage.setItem("events", JSON.stringify(newEvents));
      return newEvents;
    }
  } catch (e) {
    // error reading value
    console.log("failed to save event value");
    return null;
  }
};

export const getEventsForPrompt = async (prompt) => {
  // TODO: this should mobe to using prompt uuid insteas
  console.log("Looking for events that match", prompt);
  const events = await AsyncStorage.getItem("events");
  if (events !== null) {
    // value previously stored
    const eventArray = JSON.parse(events);
    // console.log("responses", eventArray);
    const filteredEvents = eventArray.filter(
      (event) => event?.event.name === `Fusion: ${prompt.promptText}`
    );
    return filteredEvents;
  } else {
    return [];
  }
};

export const convertTime = (time24) => {
  let hour = parseInt(time24.substring(0, 2));
  let minute = time24.substring(3, 5);
  let suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};
