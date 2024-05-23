import dayjs, { Dayjs } from "dayjs";
import { Alert, Platform } from "react-native";
import AppleHealthKit, {
  HealthInputOptions,
  HealthValue,
} from "react-native-health";

/* Permission options */
export const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      // AppleHealthKit.Constants.Permissions.HeartbeatSeries,
      // AppleHealthKit.Constants.Permissions.RestingHeartRate,
      // AppleHealthKit.Constants.Permissions.HeartRateVariability,
      // AppleHealthKit.Constants.Permissions.WalkingHeartRateAverage,
      // AppleHealthKit.Constants.Permissions.OxygenSaturation,
      // AppleHealthKit.Constants.Permissions.BodyTemperature,
      // AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
      // AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
      // AppleHealthKit.Constants.Permissions.RespiratoryRate,
      // AppleHealthKit.Constants.Permissions.BloodGlucose,
      // Sleep
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      // Activity
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      // AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      // AppleHealthKit.Constants.Permissions.DistanceCycling,
      // AppleHealthKit.Constants.Permissions.DistanceSwimming,
      // AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      // AppleHealthKit.Constants.Permissions.Workout,
      // Mindfulness
      // AppleHealthKit.Constants.Permissions.MindfulSession,
    ],
    write: [],
  },
};

export interface FusionHealthDataset {
  date: string;
  sleepSummary: FusionSleepSummary;
  stepSummary: FusionStepSummary;
  heartRateSummary?: FusionHeartRateSummary;
}

interface AppleHealthSleepSample {
  id: string; // The universally unique identifier (UUID) for this HealthKit object.
  endDate: string;
  sourceId: string;
  sourceName: string;
  startDate: string;
  value: string;
}

interface FusionStepSummary {
  date: string;
  totalSteps: number;
}
interface FusionSleepSummary {
  date: string;
  duration: number;
  // sleepStartTime: string;
  // sleepEndTime: string;
  source?: dataSource;
  summaryType?: "overall" | "device";
  sourceId?: string;
  sourceName?: string;
  value?: "awake" | "asleep" | "core" | "rem" | "deep" | "inbed";
}

interface FusionHeartRateSummary {
  date: string;
  average: number;
  min?: number;
  max?: number;
  source?: dataSource;
  summaryType?: "overall" | "device";
  sourceId?: string;
  sourceName?: string;
}

interface dataSource {
  sourceName: string;
  sourceId: string;
}

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
        // store the total for each day
        // get the difference between the start and end time for the duration of activity in each sample
        // value types: apple: INBED  oura: AWAKE, ASLEEP, CORE, REM, DEEP, INBED
        // TODO: logs can sometimes come from multiple apple devices, so we need to filter by sourceId

        for (const date of dateArray) {
          if (!sleepSummaryMap[date]) {
            sleepSummaryMap[date] = {
              date,
              duration: 0,
            };
          }

          // filter for sleep & also include from the night before after 12pm
          const filteredData = (
            results as unknown as AppleHealthSleepSample[]
          ).filter((sample) =>
            // sample.sourceId.startsWith(
            //   "com.apple.health.FCE90122-BD0E-4B5B-BC27-D1098B176FDB"
            // ) &&
            // sample.value === "INBED" &&
            dayjs(sample.startDate).isSame(dayjs(date), "day")
          );

          // TODO: we need summary's per source

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

    const heartRateSummary: FusionHeartRateSummary[] = [];
    const heartRateSummaryMap: { [date: string]: FusionHeartRateSummary } = {};

    AppleHealthKit.getHeartRateSamples(
      options,
      async (err: any, results: HealthValue[]) => {
        if (err) {
          console.error("Error fetching heart rate samples:", err);
          reject(err);
        }

        // sum them up to get the total steps but split by day
        // TODO: generate heart rate summary based on days `dateArray`
      }
    );

    resolve(heartRateSummary);
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
      /* Can now read or write to HealthKit */
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
      };

      endDate && (options.endDate = endDate.toISOString());

      // get sleep summary
      const sleepSummary = await getAppleHealthSleepSummary(startDate, endDate);
      const stepSummary = await getAppleHealthStepsSummary(startDate, endDate);

      // avg_heartrate_[morning…night],
      // AppleHealthKit.getHeartRateSamples(
      //   options,
      //   async (err: any, results: HealthValue[]) => {
      //     if (err) {
      //     }
      //     // console.log(results);
      //   }
      // );

      // build the health dataset
      for (const date of dateArray) {
        const sleepSummaryForDate = sleepSummary.find(
          (summary) => summary.date === date
        );
        const stepSummaryForDate = stepSummary.find(
          (summary) => summary.date === date
        );

        console.log("date", date);
        console.log("sleep summary", sleepSummaryForDate);
        console.log("step summary", stepSummaryForDate);

        dataset.push({
          date,
          sleepSummary: sleepSummaryForDate ?? { date, duration: 0 },
          stepSummary: stepSummaryForDate ?? { date, totalSteps: 0 },
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
