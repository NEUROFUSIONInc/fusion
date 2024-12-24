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

  console.log("returning dataset", dataset);

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

    let sleepSummary: FusionSleepSummary[] = [];

    const sleepSummaryMap: { [date: string]: FusionSleepSummary } = {};
    AppleHealthKit.getSleepSamples(
      options,
      async (err: any, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        // console.log("results", results);

        // store the total for each day
        // get the difference between the start and end time for the duration of activity in each sample
        // value types: apple: INBED  oura: AWAKE, ASLEEP, CORE, REM, DEEP, INBED
        // TODO: logs can sometimes come from multiple apple devices, so we need to filter by sourceId
        // TODO: we need summary's per source

        for (const date of dateArray) {
          if (!sleepSummaryMap[date]) {
            sleepSummaryMap[date] = {
              date,
              duration: 0,
            };
          }

          // When filtering samples to include, we choose:
          // - 6pm from previous night to 6pm of day
          const filteredData = (
            results as unknown as AppleHealthSleepSample[]
          ).filter(
            (sample) =>
              sample.value === "INBED" &&
              // For the current date, include data from the day before 6pm
              ((dayjs(sample.startDate).isSame(dayjs(date), "day") &&
                dayjs(sample.startDate).isBefore(dayjs(date).hour(18))) ||
                // For the previous date, include data from after 6pm
                (dayjs(sample.startDate).isSame(
                  dayjs(date).subtract(1, "day"),
                  "day"
                ) &&
                  dayjs(sample.startDate).isAfter(
                    dayjs(date).subtract(1, "day").hour(18)
                  )))
          );

          // if there is no sleep data for the current date, skip
          if (!filteredData.length) {
            continue;
          }

          // update the sleep summary for the current date
          for (const entry of filteredData) {
            const entryStart = dayjs(entry.startDate);
            const entryEnd = dayjs(entry.endDate);

            // Add the current entry's value to the total for the corresponding date
            sleepSummaryMap[date].duration += entryEnd.diff(
              entryStart,
              "second"
            );
          }
        }

        // Convert the map to an array of summary objects sorted by date
        sleepSummary = Object.keys(sleepSummaryMap)
          .sort() // Ensure the dates are sorted
          .map((date) => ({
            ...sleepSummaryMap[date],
          }));

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
          sleepSummary: sleepSummaryForDate ?? { date, duration: 0 },
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
