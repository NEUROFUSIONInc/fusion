// this is what will handle the configuration for when the app starts
import {
  ManualProviderSlug,
  VitalCore,
} from "@tryvital/vital-core-react-native";
import dayjs from "dayjs";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { nostrService } from "./nostr.service";
import { questService } from "./quest.service";

import { UserAccount } from "~/@types";
import { appInsights, pushVitalData } from "~/utils";

const QUEST_DATASYNC_TASK = "quest-datasync-task";
const VITAL_SYNC_TASK = "vital-data-task";

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

export const defineVitalDataSyncTask = () => {
  TaskManager.defineTask(VITAL_SYNC_TASK, async () => {
    const start = dayjs().unix();
    const userAccount: UserAccount =
      (await nostrService.getNostrAccount()) as UserAccount;
    let syncSuccess = false;
    try {
      // Push vital data if configured
      if (
        (await questService.fetchActiveQuests())?.find(
          (q) => q.guid.toLowerCase() === "4705ba7b-55b6-4c99-afb7-45c3a1fcf7ee"
        )
      ) {
        const userConnections = await VitalCore.userConnections();
        const hasAppleHealthConnection = userConnections.some(
          (connection) => connection.slug === ManualProviderSlug.AppleHealthKit
        );

        if (!hasAppleHealthConnection) {
          console.log("No Apple Health connection found");
          return;
        }

        await pushVitalData(
          userAccount.npub!,
          "4705ba7b-55b6-4c99-afb7-45c3a1fcf7ee"
        );
        syncSuccess = true;
      }
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("Error uploading vital data", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    } finally {
      const finish = dayjs().unix();
      appInsights.trackEvent({
        name: "vital_datasync_task",
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
  await BackgroundFetch.registerTaskAsync(QUEST_DATASYNC_TASK, {
    minimumInterval: 60 * 60 * 6, // 6 hrs
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });

  await BackgroundFetch.registerTaskAsync(VITAL_SYNC_TASK, {
    minimumInterval: 60 * 60 * 6, // 6 hrs
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

export const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isQuestTaskRegistered = await TaskManager.isTaskRegisteredAsync(
    QUEST_DATASYNC_TASK
  );
  const isVitalTaskRegistered = await TaskManager.isTaskRegisteredAsync(
    VITAL_SYNC_TASK
  );
  const isRegistered = isQuestTaskRegistered && isVitalTaskRegistered;
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
  await defineVitalDataSyncTask();
  await checkStatusAsync();
};
