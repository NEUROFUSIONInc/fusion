import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import {
  NotificationContentInput,
  NotificationTriggerInput,
} from "expo-notifications";
import * as Notifications from "expo-notifications";
import "react-native-get-random-values";
import { Alert, Linking, Platform } from "react-native";

import { Days, NotificationConfigDays, Prompt } from "~/@types";
import { db } from "~/lib";
import { getEvenlySpacedTimes } from "~/utils";

export class NotificationService {
  public createCustomOptionNotificationIdentifier = async (
    customOptions: string[]
  ) => {
    /**
     * Creates a custom NotificationCategory with a
     * randomUuid+"-customOptions" containing customOptions selection
     */
    const notificationOptions = customOptions.map((option: any) => ({
      identifier: option,
      buttonTitle: option,
      options: {
        opensAppToForeground: false,
      },
    }));

    const categoryIdentifier = Crypto.randomUUID() + "-customOptions";
    try {
      await Notifications.setNotificationCategoryAsync(
        categoryIdentifier,
        notificationOptions
      );
      return categoryIdentifier;
    } catch (error) {
      console.log("Unable to create notification category", error);
      return null;
    }
  };

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
     *
     * TODO: check if android work around is still needed https://github.com/expo/expo/issues/20500
     * responding from the notification menu needs more work on Android
     * so disabling all & forcing clicks
     */

    // get the available times from date ranges.
    const availableTimes = getEvenlySpacedTimes(
      prompt.notificationConfig_startTime,
      prompt.notificationConfig_endTime,
      prompt.notificationConfig_countPerDay
    );

    // get identifier for notification
    let notificationIdentifier = prompt.responseType.toString();
    if (prompt.responseType === "customOptions") {
      // if custom option generate bespoke notificationtypes with the custom option selections
      const customOptions = prompt.additionalMeta?.customOptionText?.split(";");
      if (customOptions) {
        const identifier = await this.createCustomOptionNotificationIdentifier(
          customOptions
        );
        if (!identifier) {
          console.log("error generating custom option notification identifier");
          return false;
        } else {
          notificationIdentifier = identifier;
        }
      }
    }

    const triggerObject: NotificationTriggerInput = {};
    const contentObject: NotificationContentInput = {
      title: `${prompt.promptText}`,
    };

    // if platform is android assign channel
    if (Platform.OS === "android") {
      triggerObject["channelId"] = "default";
    }
    if (Platform.OS === "ios") {
      // apply notification instruction
      contentObject["body"] = "Press and hold to respond";
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

    // Set up notification category based on whether it's a quest prompt or not
    if (prompt.additionalMeta?.questId) {
      // Check if this prompt is referenced in any other prompt's notifyConditions
      const isInNotifyConditions = await new Promise<boolean>((resolve) => {
        db.transaction((tx) => {
          tx.executeSql(
            `SELECT p.uuid FROM prompts p 
             WHERE json_extract(p.additionalMeta, '$.notifyConditions') IS NOT NULL 
             AND json_extract(p.additionalMeta, '$.notifyConditions') LIKE ?`,
            [`%"sourceId":"${prompt.uuid}"%`],
            (_, { rows }) => {
              resolve(rows.length > 0);
            },
            (_, error) => {
              console.log("Error checking notify conditions:", error);
              resolve(false);
              return false;
            }
          );
        });
      });

      if (isInNotifyConditions) {
        if (Platform.OS === "android") {
          // make it like just a normal notification by not providing a categoryIdentifier
        } else {
          contentObject["categoryIdentifier"] = "quest_prompt";
        }
      } else {
        // Keep the default notification behavior
        if (Platform.OS === "android") {
          // make it like just a normal notification by not providing a categoryIdentifier
        } else {
          contentObject["categoryIdentifier"] = notificationIdentifier;
        }
      }
    } else {
      // Handle non-quest prompts as before
      if (Platform.OS === "android") {
        // make it like just a normal notification by not providing a categoryIdentifier
      } else {
        contentObject["categoryIdentifier"] = notificationIdentifier;
      }
    }

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

  public removeNotificationsForPromptFromTray = async (promptUuid: string) => {
    const notificationIds =
      await notificationService.getNotificationIdsForPrompt(promptUuid);
    if (notificationIds) {
      await Promise.all(
        notificationIds.map((id) => Notifications.dismissNotificationAsync(id))
      );
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

  public registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    (async () => {
      if (existingStatus !== "granted") {
        Alert.alert(
          "Notification Permission",
          "We need your permission to send you notifications based on your prompt settings.",
          [
            {
              text: "OK",
              onPress: async () => {
                const { status } =
                  await Notifications.requestPermissionsAsync();
                finalStatus = status;
                if (finalStatus !== "granted") {
                  Alert.alert(
                    "Enable notifications",
                    "We only notify you based on your prompt settings. Please enable notifications in your settings to continue.",
                    [
                      {
                        text: "OK",
                        onPress: async () => {
                          Linking.openURL("app-settings:Fusion");
                        },
                      },
                    ]
                  );
                } else {
                  if (Platform.OS === "android") {
                    await Notifications.setNotificationChannelAsync("default", {
                      name: "default",
                      importance: Notifications.AndroidImportance.MAX,
                      vibrationPattern: [0, 250, 250, 250],
                      lightColor: "#FF231F7C",
                    });
                  }
                }
              },
              isPreferred: true,
            },
            {
              text: "Cancel",
              onPress: async () => {
                Alert.alert(
                  "Notifications Disabled",
                  "You can continue to use Fusion without notifications, but you will not be notified of any prompts you have enabled. You will need to open the app to log responses by yourself"
                );
              },
              style: "destructive",
            },
          ]
        );
      } else {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      }
    })();
  };

  public setUpNotificationCategories = async () => {
    /**
     * Sets up prompt notification categories
     * - yesno, number, text
     * - customOption categories are created on the fly
     */
    await Notifications.setNotificationCategoryAsync("yesno", [
      {
        identifier: "Yes",
        buttonTitle: "Yes",
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: "No",
        buttonTitle: "No",
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
    let placeholderTextInput = { placeholder: "" };
    let placeholderNumberInput = { placeholder: "" };
    // This is work around a bug in expo-notifications
    if (Platform.OS !== "android") {
      placeholderTextInput = {
        placeholder: "Type your response here",
      };
      placeholderNumberInput = {
        placeholder: "Enter a number",
      };
    }
    await Notifications.setNotificationCategoryAsync("number", [
      {
        identifier: "number",
        buttonTitle: "Respond",
        textInput: {
          submitButtonTitle: "Log",
          ...placeholderNumberInput,
        },
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
    await Notifications.setNotificationCategoryAsync("text", [
      {
        identifier: "text",
        buttonTitle: "Respond",
        textInput: {
          submitButtonTitle: "Log",
          ...placeholderTextInput,
        },
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
    // Set up quest prompt notification that opens the app since this prompt is referenced by others
    await Notifications.setNotificationCategoryAsync("quest_prompt", [
      {
        identifier: "quest_prompt_action",
        buttonTitle: "Respond",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  };

  public saveCutomNotificationToDb = async (
    notificationId: string,
    title: string
  ) => {
    try {
      const storeDetailsInDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "INSERT INTO custom_notifications (notificationId, title) VALUES (?, ?)",
              [notificationId, title],
              () => {
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

  public scheduleInsightNotifications = async () => {
    /**
     * Schedules notification for fusion insights
     * - weekly on sunday
     * - monthly on the first of every month
     *
     * flag for when it's set `insightNotificationsScheduled`
     */
    const isScheduled = await AsyncStorage.getItem(
      "insightNotificationsScheduled"
    );
    if (isScheduled === "true") {
      return;
    }
    const triggerObject: NotificationTriggerInput = {};
    const contentObject: NotificationContentInput = {};

    // if platform is android assign channel
    if (Platform.OS === "android") {
      triggerObject["channelId"] = "default";
    }

    contentObject["title"] = `Your weekly insights are ready ✨`;
    contentObject["categoryIdentifier"] = "insight_weekly";
    if (Platform.OS === "ios") {
      // apply notification instruction
      contentObject["body"] = `Reflect on last week and plan ahead`;
    }

    await Notifications.setNotificationCategoryAsync(
      contentObject["categoryIdentifier"],
      [
        {
          identifier: contentObject["categoryIdentifier"],
          buttonTitle: "View",
          options: {
            opensAppToForeground: true,
          },
        },
      ]
    );
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: contentObject,
      trigger: {
        ...triggerObject,
        hour: 12,
        minute: 0,
        weekday: 1,
        repeats: true,
      },
    });
    await this.saveCutomNotificationToDb(
      notificationId,
      contentObject["categoryIdentifier"]
    );

    // monthly insights
    for (let i = 0; i <= 11; i++) {
      // apply notification instruction
      contentObject["title"] = `Your monthly insights are ready ✨`;
      contentObject["categoryIdentifier"] = `insight_monthly_${i}`;
      if (Platform.OS === "ios") {
        // apply notification instruction
        contentObject["body"] = `Reflect on last month and plan ahead`;
      }

      await Notifications.setNotificationCategoryAsync(
        contentObject["categoryIdentifier"],
        [
          {
            identifier: contentObject["categoryIdentifier"],
            buttonTitle: "View",
            options: {
              opensAppToForeground: true,
            },
          },
        ]
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: contentObject,
        trigger: {
          ...triggerObject,
          hour: 12,
          minute: 0,
          month: i,
          day: 1,
          repeats: true,
        },
      });
      await this.saveCutomNotificationToDb(
        notificationId,
        contentObject["categoryIdentifier"]
      );
    }

    // write a flag to the localstorage
    await AsyncStorage.setItem("insightNotificationsScheduled", "true");
  };

  public scheduleOutreachNotifications = async () => {
    /**
     * Schedules outreach notifications
     * - first notification 30 seconds after the app is opened
     * - repeated notifications for the next 7 days
     *
     * flag for when it's set `outreachNotificationsScheduled`
     */
    const isScheduled = await AsyncStorage.getItem(
      "outreachNotificationsScheduled"
    );
    if (isScheduled === "true") {
      return;
    }
    const triggerObject: NotificationTriggerInput = {};
    const contentObject: NotificationContentInput = {};

    // if platform is android assign channel
    if (Platform.OS === "android") {
      triggerObject["channelId"] = "default";
    }

    contentObject["title"] = `We'd love to speak with you 🫵🏾`;
    contentObject["categoryIdentifier"] = "outreach";
    if (Platform.OS === "ios") {
      // apply notification instruction
      contentObject[
        "body"
      ] = `You're one of our top users! Want to help make Fusion better?`;
    }
    await Notifications.setNotificationCategoryAsync(
      contentObject["categoryIdentifier"],
      [
        {
          identifier: contentObject["categoryIdentifier"],
          buttonTitle: "Speak with the team",
          options: {
            opensAppToForeground: true,
          },
        },
      ]
    );

    // first notification 60 seconds after the app is opened
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: contentObject,
      trigger: {
        ...triggerObject,
        seconds: 30,
      },
    });
    await this.saveCutomNotificationToDb(
      notificationId,
      contentObject["categoryIdentifier"]
    );

    // repeated notifications for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: contentObject,
        trigger: {
          ...triggerObject,
          seconds: 60 * 60 * 24 * i,
          repeats: false,
        },
      });
      await this.saveCutomNotificationToDb(
        notificationId,
        contentObject["categoryIdentifier"]
      );
    }

    await AsyncStorage.setItem("outreachNotificationsScheduled", "true");
  };

  public disableCustomNotificationByTitle = async (title: string) => {
    /**
     * Searches for the notifications ids for a title
     * Disable them, delete from db
     */
    try {
      const getNotificationIdsFromDb = () => {
        return new Promise<string[]>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT notificationId FROM custom_notifications WHERE title = ?",
              [title],
              (_, { rows }) => {
                const notificationIds = rows._array.map(
                  (row: any) => row.notificationId
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
      if (notificationIds && notificationIds.length > 0) {
        notificationIds.forEach(async (id) => {
          await Notifications.dismissNotificationAsync(id);
        });
      }

      const deleteNotificationIdsFromDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM custom_notifications WHERE title = ?",
              [title],
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

  /**
   * Create prompt_notifications entry in sqlite
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

      // TODO: if notification is for custom options
      // delete "...customOption" category identifier
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
                if (rows.length < 1) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject("no prompt found for notificationId");
                  return false;
                }
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
