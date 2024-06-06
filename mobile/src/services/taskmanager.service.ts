// this is what will handle the configuration for when the app starts
import dayjs from "dayjs";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { nostrService } from "./nostr.service";
import { questService } from "./quest.service";

import { UserAccount } from "~/@types";
import { appInsights } from "~/utils";

const INSIGHT_NOTIFICATION_TASK = "insight-notification-task";
const QUEST_DATASYNC_TASK = "quest-datasync-task";

export const defineQuestDataSyncTask = () => {
  TaskManager.defineTask(QUEST_DATASYNC_TASK, async () => {
    const start = dayjs().unix();
    let syncSuccess = false;
    // fetch all the quests locally and upload quests if they exist
    const activeQuests = await questService.fetchActiveQuests();
    try {
      for (const quest of activeQuests) {
        syncSuccess = await questService.uploadQuestDataset(quest.guid);
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    } catch (error) {
      console.error("Error uploading quest dataset", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    } finally {
      const finish = dayjs().unix();
      const userAccount: UserAccount =
        (await nostrService.getNostrAccount()) as UserAccount;
      appInsights.trackEvent({
        name: "quest_datasync_task",
        properties: {
          userNpub: userAccount.npub,
          syncSuccess,
          start,
          finish,
        },
      });
    }
  });
};

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(QUEST_DATASYNC_TASK, {
    minimumInterval: 60 * 60 * 6, // 6 hrs
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

export const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    QUEST_DATASYNC_TASK
  );
  console.log("Background activity status", status);
  console.log("Task Manager registration", isRegistered);

  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    console.error(
      "Background activity is restricted. Please enable it in device settings."
    );
    // todo: display alert that sends them to app settings
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.error(
      "Background activity is denied. Please enable it in device settings."
    );
    // todo: display alert that sends them to app settings
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    console.log("Background activity is available");
    if (!isRegistered) {
      await registerBackgroundFetchAsync();
      const tasks = await TaskManager.getRegisteredTasksAsync();
      console.log("registered tasks", tasks);
    }
  }
};

export const setupBackgroundTasks = async () => {
  await defineQuestDataSyncTask();
  await checkStatusAsync();
};
