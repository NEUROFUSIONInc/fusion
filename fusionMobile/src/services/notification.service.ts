import {
  NotificationContentInput,
  NotificationTriggerInput,
} from "expo-notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { Days, NotificationConfigDays, Prompt } from "~/@types";
import { db } from "~/lib";
import { getEvenlySpacedTimes } from "~/utils";

export class NotificationService {
  public scheduleFusionNotification = async (prompt: Prompt) => {
    /**
     * Schedules a notification for a Fusion prompt
     *
     * - delete any existing notifications for this prompt
     * - check if all the days are selected.
     * - if yes, use DailyInputTrigger
     * - if no, loop through the days and use WeeklyInputTrigger
     * - save notificationId to sqlite
     * - update 'isScheduled' for prompt
     */

    // get the available times from date ranges.
    const availableTimes = getEvenlySpacedTimes(
      prompt.notificationConfig_startTime,
      prompt.notificationConfig_endTime,
      prompt.notificationConfig_countPerDay
    );

    const triggerObject: NotificationTriggerInput = {};
    const contentObject: NotificationContentInput = {
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
        ? (JSON.parse(prompt.notificationConfig_days) as NotificationConfigDays)
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
      await this.cancelExistingNotificationForPrompt(prompt.uuid);

      console.log("availableTimes", availableTimes);

      for (const time of availableTimes) {
        const [hours, minutes] = time.split(":").map(Number);

        // loop through the days...
        const weekdays = Object.keys(daysObject).filter(
          (day) => daysObject[day as Days] === true
        );

        if (weekdays.length === 7) {
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
          await this.saveNotificationIdForPrompt(notificationId, prompt.uuid);
        } else {
          for (const weekday of weekdays) {
            // schedule weekly notification trigger for every day selected
            const notificationId =
              await Notifications.scheduleNotificationAsync({
                content: contentObject,
                trigger: {
                  ...triggerObject,
                  hour: hours,
                  minute: minutes,
                  repeats: true,
                  weekday: dayToNumber[weekday as Days],
                },
              });
            // save notificationId & promptId to db
            await this.saveNotificationIdForPrompt(notificationId, prompt.uuid);
          }
        }
      }
    } catch (e) {
      console.log("Unable to schedule notification", e);
      return false;
    }

    return true;
  };

  public cancelExistingNotificationForPrompt = async (promptId: string) => {
    /**
     * Cancels the existing notification for a prompt
     * - get all the notificationIds for the prompt
     * - cancel all the notifications
     * - delete the notificationIds from the db
     */

    // now read from the db and cancel all the notifications
    try {
      const notificationIds = await this.getNotificationIdsForPrompt(promptId);
      for (const notificationId of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        // delete the notificationIds from the per id
        await this.deleteNotificationIdForPrompt(promptId, notificationId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  public getNotificationIdsForPrompt = async (promptId: string) => {
    try {
      const getNotificationIdsFromDb = () => {
        return new Promise<string[]>((resolve, reject) => {
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
                return false;
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
  public saveNotificationIdForPrompt = async (
    notificationId: string,
    promptId: string
  ) => {
    try {
      const storeDetailsInDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "INSERT INTO prompt_notifications (notificationId, promptUuid) VALUES (?, ?)",
              [notificationId, promptId],
              () => {
                console.log("notificationId saved in db");
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

  public deleteNotificationIdForPrompt = async (
    promptId: string,
    notificationId: string
  ) => {
    try {
      const deleteNotificationIdsFromDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM prompt_notifications WHERE promptUuid = ? AND notificationId = ?",
              [promptId, notificationId],
              () => {
                console.log("notificationIds deleted");
                resolve(true);
              },
              (_, error) => {
                console.log("error deleting notificationIds from db");
                reject(error);
                return false;
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

  public getPromptForNotificationId = async (notificationId: string) => {
    try {
      const getPromptFromDb = () => {
        return new Promise<string>((resolve, reject) => {
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
                return false;
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
}

export const notificationService = Object.freeze(new NotificationService());
