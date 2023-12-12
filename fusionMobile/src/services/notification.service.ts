import {
  NotificationContentInput,
  NotificationTriggerInput,
} from "expo-notifications";
import * as Notifications from "expo-notifications";
import "react-native-get-random-values";
import * as Crypto from "expo-crypto";
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
      title: `Fusion: ${prompt.promptText}`,
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

    // one more quirk for Android - https://github.com/expo/expo/issues/20500
    // responding from the notification menu needs more work on Android
    // so disabling all & forcing clicks
    if (Platform.OS === "android") {
      // make it like just a normal notification by not providing a categoryIdentifier
    } else {
      contentObject["categoryIdentifier"] = notificationIdentifier;
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
