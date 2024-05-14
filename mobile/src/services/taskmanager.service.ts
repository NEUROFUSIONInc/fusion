// this is what will handle the configuration for when the app starts
import dayjs from "dayjs";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const INSIGHT_NOTIFICATION_TASK = "insight-notification-task";
export const defineBackgroundInsightNotificationTasks = async () => {
  TaskManager.defineTask(INSIGHT_NOTIFICATION_TASK, async () => {
    // todo: get dynamic insight for period
    const now = dayjs().unix();
    console.log(`Background notification task fired at ${now}`);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });
};

async function registerInsightNotificationTaskAsync() {
  return BackgroundFetch.registerTaskAsync(INSIGHT_NOTIFICATION_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

async function unregisterInsightNotificationTaskAsync() {
  return BackgroundFetch.unregisterTaskAsync(INSIGHT_NOTIFICATION_TASK);
}

const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    INSIGHT_NOTIFICATION_TASK
  );
  console.log("Background activity status", status);
  console.log("Task Manager registration", isRegistered);

  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    console.warn(
      "Background activity is restricted. Please enable it in device settings."
    );
    // todo: display alert that sends them to app settings
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.warn(
      "Background activity is denied. Please enable it in device settings."
    );
    // todo: display alert that sends them to app settings
  } else if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    if (!isRegistered) {
      const tasks = await TaskManager.getRegisteredTasksAsync();
      console.log("registered tasks", tasks);
      await registerInsightNotificationTaskAsync();
    }
  }
};
