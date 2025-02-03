import dayjs, { Dayjs } from "dayjs";
import { Alert, Platform } from "react-native";
import AppleHealthKit, {
  HealthInputOptions,
  HealthValue,
} from "react-native-health";

import {
  FusionHealthDataset,
  FusionSleepSummary,
  FusionStepSummary,
  FusionHeartRateSummary,
  AppleHealthSleepSample,
} from "../@types";

import { getApiService } from "./utils";

/* Permission options */
export const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
    ],
    write: [],
  },
};

// build dataset for querying
export const buildHealthDataset = async (startDate: Dayjs, endDate: Dayjs) => {
  /**
   * Returns a dataset of health data for the given date range
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   *
   * @returns healthDataset[]
   */

  let dataset: FusionHealthDataset[] = [];
  if (Platform.OS === "ios") {
    dataset = await buildHealthDataFromApple(startDate, endDate);
  }

  return dataset;
};

export const getAppleHealthSleepSummary = async (
  startDate: Dayjs,
  endDate: Dayjs
) => {
  return new Promise<FusionSleepSummary[]>((resolve, reject) => {
    const daysInRange = endDate?.diff(startDate.startOf("day"), "day") + 1;
    const dateArray: string[] = [];
    for (let i = 0; i < daysInRange; i++) {
      const date = startDate.add(i, "day").format("YYYY-MM-DD");
      dateArray.push(date);
    }

    const options: HealthInputOptions = {
      startDate: startDate.toISOString(),
    };
    endDate && (options.endDate = endDate.toISOString());

    // Map to store sleep data grouped by date
    const sleepDataMap: {
      [date: string]: {
        sources: {
          [sourceId: string]: {
            sourceName: string;
            stages: {
              [key: string]: number;
            };
          };
        };
      };
    } = {};

    AppleHealthKit.getSleepSamples(
      options,
      async (err: any, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        const samples = results as unknown as AppleHealthSleepSample[];

        for (const date of dateArray) {
          const currentDate = dayjs(date).startOf("day");
          const previousDate = currentDate.subtract(1, "day");
          const currentDayCutoff = currentDate.hour(12);
          const previousDayCutoff = previousDate.hour(18);

          const filteredData = samples.filter((sample) => {
            const sampleDate = dayjs(sample.startDate);

            // Include current day data before 6pm
            const isCurrentDayBeforeCutoff =
              sampleDate.isSame(currentDate, "day") &&
              sampleDate.isBefore(currentDayCutoff);

            // Include previous day data after 6pm
            const isPreviousDayAfterCutoff =
              sampleDate.isSame(previousDate, "day") &&
              sampleDate.isAfter(previousDayCutoff);

            return isCurrentDayBeforeCutoff || isPreviousDayAfterCutoff;
          });

          // Initialize the date entry if it doesn't exist
          if (!sleepDataMap[date]) {
            sleepDataMap[date] = {
              sources: {},
            };
          }

          // Process filtered data
          for (const sample of filteredData) {
            // Initialize the source if it doesn't exist
            if (!sleepDataMap[date].sources[sample.sourceId]) {
              sleepDataMap[date].sources[sample.sourceId] = {
                sourceName: sample.sourceName,
                stages: {},
              };
            }

            const duration = dayjs(sample.endDate).diff(
              dayjs(sample.startDate),
              "second"
            );

            // Add duration to the appropriate stage
            if (sample.value) {
              const sourceData = sleepDataMap[date].sources[sample.sourceId];
              sourceData.stages[sample.value] =
                (sourceData.stages[sample.value] || 0) + duration;
            }
          }
        }

        // Convert the map to FusionSleepSummary array
        const sleepSummary: FusionSleepSummary[] = Object.entries(sleepDataMap)
          .map(([date, data]) => ({
            date,
            sources: data.sources,
          }))
          .filter((summary) => Object.keys(summary.sources).length > 0); // Only include dates with data

        resolve(sleepSummary);
      }
    );
  });
};

export const getAppleHealthStepsSummary = async (
  startDate: Dayjs,
  endDate: Dayjs
) => {
  return new Promise<FusionStepSummary[]>((resolve, reject) => {
    let stepSummary: { date: string; totalSteps: number }[] = [];
    const stepSummaryMap: { [date: string]: number } = {};

    const options: HealthInputOptions = {
      startDate: startDate.toISOString(),
    };

    endDate && (options.endDate = endDate.toISOString());

    AppleHealthKit.getDailyStepCountSamples(
      options,
      async (err: any, results: HealthValue[]) => {
        if (err) {
          console.error("Error fetching step count samples:", err);
          reject(err);
          return;
        }

        // sum them up to get the total steps but split by day
        // Aggregate steps by date
        for (const entry of results) {
          const { startDate, value } = entry;
          const date = dayjs(startDate).format("YYYY-MM-DD");

          // Check if the date already exists in the map, if not initialize to 0
          if (!stepSummaryMap[date]) {
            stepSummaryMap[date] = 0;
          }

          // Add the current entry's value to the total for the corresponding date
          stepSummaryMap[date] += value;
        }

        // Convert the map to an array of summary objects sorted by date
        stepSummary = Object.keys(stepSummaryMap)
          .sort() // Ensure the dates are sorted
          .map((date) => ({
            date,
            totalSteps: stepSummaryMap[date],
          }));

        // Log the final daily step summaries
        resolve(stepSummary);
      }
    );
  });
};

export const getAppleHealthHeartRateSummary = async (
  startDate: Dayjs,
  endDate: Dayjs
) => {
  return new Promise<FusionHeartRateSummary[]>((resolve, reject) => {
    const daysInRange = endDate?.diff(startDate.startOf("day"), "day") + 1;
    const dateArray: string[] = [];
    for (let i = 0; i < daysInRange; i++) {
      const date = startDate.add(i, "day").format("YYYY-MM-DD");
      dateArray.push(date);
    }

    const options: HealthInputOptions = {
      startDate: startDate.toISOString(),
    };
    endDate && (options.endDate = endDate.toISOString());

    const heartRateSummaryMap: {
      [date: string]: { value: number; startDate: string }[];
    } = {};

    AppleHealthKit.getHeartRateSamples(
      options,
      async (err: any, results: HealthValue[]) => {
        if (err) {
          console.error("Error fetching heart rate samples:", err);
          reject(err);
          return;
        }

        // Initialize empty arrays for each date
        dateArray.forEach((date) => {
          heartRateSummaryMap[date] = [];
        });

        // Group heart rate values by date
        for (const entry of results) {
          const { startDate, value } = entry;
          const date = dayjs(startDate).format("YYYY-MM-DD");

          if (heartRateSummaryMap[date]) {
            heartRateSummaryMap[date].push({ value, startDate });
          }
        }

        // Calculate summaries for each date
        const heartRateSummary = dateArray.map((date) => {
          const dayStart = dayjs(date).startOf("day");
          const samples = heartRateSummaryMap[date];

          const morning = samples.filter((s) => {
            const time = dayjs(s.startDate);
            return (
              time.isAfter(dayStart.add(6, "hour")) &&
              time.isBefore(dayStart.add(12, "hour"))
            );
          });

          const afternoon = samples.filter((s) => {
            const time = dayjs(s.startDate);
            return (
              time.isAfter(dayStart.add(12, "hour")) &&
              time.isBefore(dayStart.add(18, "hour"))
            );
          });

          const night = samples.filter((s) => {
            const time = dayjs(s.startDate);
            return (
              time.isAfter(dayStart.add(18, "hour")) ||
              time.isBefore(dayStart.add(6, "hour"))
            );
          });

          return {
            date,
            average:
              samples.reduce((acc, s) => acc + s.value, 0) / samples.length ||
              0,
            morning:
              morning.reduce((acc, s) => acc + s.value, 0) / morning.length ||
              0,
            afternoon:
              afternoon.reduce((acc, s) => acc + s.value, 0) /
                afternoon.length || 0,
            night:
              night.reduce((acc, s) => acc + s.value, 0) / night.length || 0,
          };
        });

        resolve(heartRateSummary);
      }
    );
  });
};

// store the total for each day
// get the difference between the start and end time for the duration of activity in each sample
// value types: apple: INBED  oura: AWAKE, ASLEEP, CORE, REM, DEEP, INBED
export const buildHealthDataFromApple = (startDate: Dayjs, endDate: Dayjs) => {
  return new Promise<FusionHealthDataset[]>((resolve, reject) => {
    const daysInRange = endDate.diff(startDate.startOf("day"), "day") + 1;
    const dateArray: string[] = [];
    for (let i = 0; i < daysInRange; i++) {
      const date = startDate.add(i, "day").format("YYYY-MM-DD");
      dateArray.push(date);
    }
    console.log("date array", dateArray);

    const dataset: FusionHealthDataset[] = [];

    AppleHealthKit.initHealthKit(permissions, async (error) => {
      if (error) {
        Alert.alert("Missing permissions", "Cannot grant permissions!");
      }

      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
      };
      endDate && (options.endDate = endDate.toISOString());

      // get sleep summary
      const sleepSummary = await getAppleHealthSleepSummary(startDate, endDate);
      const stepSummary = await getAppleHealthStepsSummary(startDate, endDate);
      const heartRateSummary = await getAppleHealthHeartRateSummary(
        startDate,
        endDate
      );

      // build the health dataset
      for (const date of dateArray) {
        const sleepSummaryForDate = sleepSummary.find(
          (summary) => summary.date === date
        );
        const stepSummaryForDate = stepSummary.find(
          (summary) => summary.date === date
        );
        const heartRateSummaryForDate = heartRateSummary.find(
          (summary) => summary.date === date
        );

        dataset.push({
          date,
          sleepSummary: sleepSummaryForDate ?? { date, sources: {} },
          stepSummary: stepSummaryForDate ?? { date, totalSteps: 0 },
          heartRateSummary: heartRateSummaryForDate ?? {
            date,
            average: 0,
            morning: 0,
            afternoon: 0,
            night: 0,
          },
        });
      }

      resolve(dataset);
    });
  });
};

export const connectAppleHealth = async () => {
  if (Platform.OS === "ios") {
    return new Promise<boolean>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        /* Called after we receive a response from the system */
        if (error) {
          console.log("[ERROR] Cannot grant permissions!");
          resolve(false);
        } else {
          console.log("[SUCCESS] Permissions granted!");
          resolve(true);
        }
      });
    });
  }
  return false;
};

export const connectGoogleFit = async () => {
  return false;
};

/**
 * Methods for connecting with the Vital APIs
 */
export const connectWithVital = async (questId: string, device: string) => {
  const apiService = await getApiService();

  try {
    const res = await apiService?.get("/vital/quest/get-token", {
      params: {
        questId,
        device,
      },
    });

    if (res?.status === 200) {
      // handle based on the device
      if (device.toLowerCase() === "oura") {
        return res.data.linkUrl;
      } else {
        return res.data.signInToken;
      }
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};
