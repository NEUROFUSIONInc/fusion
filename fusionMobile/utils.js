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

      // TODO: fallback to schedule any notifications not scheduled
      // in the future will want to keep this to just scheduling on save
      // If prompt is active & there's no notification, schedule it
      savedPrompts.forEach(async (prompt) => {
        const notification = scheduledNotifications.find(
          (n) => n.identifier === prompt.uuid
        );
        if (!notification) {
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

export const scheduleFusionNotification = async (prompt) => {
  /**
   * Schedules a notification for a Fusion prompt
   */

  // convert prompt interval to seconds
  let promptIntervalSeconds;
  switch (prompt.notificationFrequency.unit) {
    case "hours":
      promptIntervalSeconds = prompt.notificationFrequency.value * 3600;
      break;
    case "minutes":
      promptIntervalSeconds = prompt.notificationFrequency.value * 60;
      break;
    case "days":
      promptIntervalSeconds = prompt.notificationFrequency.value * 86400;
      break;
  }

  try {
    // cancel existing notification
    await Notifications.cancelScheduledNotificationAsync(prompt.uuid);

    // if platform is android assign channel
    let triggerObject = {};
    if (Platform.OS === "android") {
      triggerObject["channelId"] = "default";
    }

    // schedule new notification
    await Notifications.scheduleNotificationAsync({
      identifier: prompt.uuid,
      content: {
        title: `Fusion: ${prompt.promptText}`,
        body: "Press & hold to log",
        categoryIdentifier: prompt.responseType,
      },
      trigger: {
        ...triggerObject,
        repeats: true,
        seconds: promptIntervalSeconds,
      },
    });
  } catch (e) {
    console.log("Unable to schedule notification");
    return false;
  }

  return true;
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
    if (prompts.length > 0) {
      return prompts;
    }
  } catch (e) {
    console.log("error reading prompts", e);
    return null;
  }
};

export const deletePrompt = async (uuid) => {
  try {
    const prompts = await AsyncStorage.getItem("prompts");
    if (prompts !== null) {
      // value previously stored
      const promptArray = JSON.parse(prompts);
      const newPromptArray = promptArray.filter(
        (prompt) => prompt.uuid !== uuid
      );

      // cancel the notification
      await Notifications.cancelScheduledNotificationAsync(uuid);

      await AsyncStorage.setItem("prompts", JSON.stringify(newPromptArray));
      return newPromptArray;
    }
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

    // TODO: check if prompt already exists, if so update it
    console.log("saving prompt", prompt);

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
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
          },
          (_, error) => {
            reject(error);
          }
        );

        // get list of current prompts
        tx.executeSql("SELECT * FROM prompts", [], (_, { rows }) => {
          resolve(rows._array);
        });
      });
    });

    // schedule notification for the prompt here.
    // await scheduleFusionNotification(prompt);
  } catch (error) {
    console.log(error);
    return null;
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
