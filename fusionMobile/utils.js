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

      // TODO: hack to flush previous notifications
      // If scheduled notification identifier isn't a valid prompt.uuid, cancel it
      scheduledNotifications.forEach((notification) => {
        const prompt = savedPrompts.find(
          (p) => p.uuid === notification.identifier
        );
        if (!prompt) {
          Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      });

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
    const prompts = await AsyncStorage.getItem("prompts");
    if (prompts !== null) {
      // value previously stored
      console.log(prompts);
      const promptArray = JSON.parse(prompts);
      return promptArray;
    }
  } catch (e) {
    // error reading value
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
  notificationFrequencyValue,
  notificationFrequencyUnit,
  uuid = null
) => {
  /**
   * Sets or saves a prompt to the AsyncStorage
   *
   * uuid - optional parameter to set the prompt UUID, when this is passed an existing prompt will be updated
   *
   * TODO: add "isActive"
   */
  if (
    !promptText ||
    !responseType ||
    !notificationFrequencyValue ||
    !notificationFrequencyUnit
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
      notificationFrequency: {
        value: notificationFrequencyValue,
        unit: notificationFrequencyUnit,
      },
    };

    // save/update prompts
    // get the current prompts
    let currentPrompts = await readSavedPrompts();
    let promptIndex = -1;
    if (currentPrompts) {
      // Check if prompt with same UUID already exists in the array
      promptIndex = currentPrompts.findIndex((p) => p.uuid === prompt.uuid);
    } else {
      // if there are no prompts, create an empty array
      currentPrompts = [];
    }

    if (promptIndex >= 0) {
      // Overwrite existing prompt with the same UUID
      currentPrompts[promptIndex] = prompt;
    } else {
      // add the new prompt to the array
      currentPrompts.push(prompt);
    }

    // update the prompts
    await AsyncStorage.setItem("prompts", JSON.stringify(currentPrompts));

    // TODO: schedule notification for the prompt here.
    await Notifications.cancelScheduledNotificationAsync(prompt.uuid);
    // schedule notification
    await scheduleFusionNotification(prompt);

    return currentPrompts;
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
