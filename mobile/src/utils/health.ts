import { VitalCore } from "@tryvital/vital-core-react-native";
import {
  VitalHealth,
  HealthConfig,
  VitalResource,
} from "@tryvital/vital-health-react-native";
import dayjs, { Dayjs } from "dayjs";
import { Alert, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
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
  ProcessedHealthData,
} from "../@types";

import { appInsights } from "./appInsights";
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
export const connectWithVital = async (
  questId: string,
  device: string,
  deviceId: string
) => {
  const apiService = await getApiService();

  try {
    const res = await apiService?.get("/vital/quest/get-token", {
      params: {
        questId,
        device,
        deviceId,
      },
    });

    if (res?.status === 200) {
      // handle based on the device
      if (["oura", "whoop"].includes(device.toLowerCase())) {
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

export const pushVitalData = async (userNpub: string, quest_id: string) => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const linkToken = await connectWithVital(
      quest_id,
      "Apple Health",
      deviceId
    );

    if (!linkToken) {
      console.log("Failed to get link token");
      return;
    }

    // sign in the user
    const status = await VitalCore.status();
    if (status.includes("signedIn")) {
      console.log("already signed in");
      await VitalCore.signOut();
    }
    await VitalCore.signIn(linkToken);

    const config = new HealthConfig();
    config.numberOfDaysToBackFill = 180;
    await VitalHealth.configure(config);

    await VitalHealth.ask(
      [
        VitalResource.Sleep,
        VitalResource.HeartRate,
        VitalResource.HeartRateVariability,
        VitalResource.BloodOxygen,
        VitalResource.Steps,
      ],
      []
    );
    await VitalHealth.syncData();

    appInsights.trackEvent(
      {
        name: "vital_sync_success",
      },
      {
        userNpub,
      }
    );

    return true;
  } catch (err) {
    console.error(err);
    appInsights.trackEvent(
      {
        name: "vital_sync_error",
      },
      {
        userNpub,
        error: JSON.stringify(err),
      }
    );
  }
};

// Process health data to calculate summary statistics
export const processHealthData = (
  data: FusionHealthDataset[]
): ProcessedHealthData | null => {
  if (!data || data.length === 0) return null;

  // Calculate averages and extract useful insights
  const processedData: ProcessedHealthData = {
    raw: data,
    summary: {
      dateRange: {
        start: data[0]?.date,
        end: data[data.length - 1]?.date,
      },
      sleep: calculateSleepSummary(data),
      steps: calculateStepsSummary(data),
      heartRate: calculateHeartRateSummary(data),
      trends: calculateHealthTrends(data),
    },
  };

  return processedData;
};

// Calculate trends across health metrics
export const calculateHealthTrends = (data: FusionHealthDataset[]) => {
  if (!data || data.length < 7) return { sufficient: false }; // Need at least a week of data

  // Sort data by date
  const sortedData = [...data].sort((a, b) =>
    dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
  );

  // Calculate week-over-week changes
  const midpoint = Math.floor(sortedData.length / 2);
  const firstHalf = sortedData.slice(0, midpoint);
  const secondHalf = sortedData.slice(midpoint);

  // Sleep trend
  const sleepTrend = calculateMetricTrend(firstHalf, secondHalf, (day) => {
    let totalSleep = 0;
    let count = 0;
    Object.values(day.sleepSummary.sources).forEach((source: any) => {
      const totalSeconds = Object.values(source.stages).reduce(
        (total: number, duration: any) => total + (Number(duration) || 0),
        0
      );
      totalSleep += totalSeconds / 3600; // convert to hours
      count++;
    });
    return count > 0 ? totalSleep / count : 0;
  });

  // Steps trend
  const stepsTrend = calculateMetricTrend(
    firstHalf,
    secondHalf,
    (day) => day.stepSummary?.totalSteps || 0
  );

  // Heart rate trend
  const heartRateTrend = calculateMetricTrend(
    firstHalf,
    secondHalf,
    (day) => day.heartRateSummary?.average || 0
  );

  return {
    sufficient: true,
    sleep: sleepTrend,
    steps: stepsTrend,
    heartRate: heartRateTrend,
    period: {
      firstHalf: {
        start: firstHalf[0]?.date,
        end: firstHalf[firstHalf.length - 1]?.date,
      },
      secondHalf: {
        start: secondHalf[0]?.date,
        end: secondHalf[secondHalf.length - 1]?.date,
      },
    },
  };
};

// Helper function to calculate trend between two periods
export const calculateMetricTrend = (
  firstPeriod: FusionHealthDataset[],
  secondPeriod: FusionHealthDataset[],
  metricExtractor: (day: FusionHealthDataset) => number
) => {
  // Filter out days with no data
  const validFirstPeriod = firstPeriod.filter(
    (day) => metricExtractor(day) > 0
  );
  const validSecondPeriod = secondPeriod.filter(
    (day) => metricExtractor(day) > 0
  );

  if (validFirstPeriod.length === 0 || validSecondPeriod.length === 0) {
    return { available: false };
  }

  // Calculate averages
  const firstAverage =
    validFirstPeriod.reduce((sum, day) => sum + metricExtractor(day), 0) /
    validFirstPeriod.length;
  const secondAverage =
    validSecondPeriod.reduce((sum, day) => sum + metricExtractor(day), 0) /
    validSecondPeriod.length;

  // Calculate percentage change
  const percentChange =
    firstAverage > 0
      ? ((secondAverage - firstAverage) / firstAverage) * 100
      : 0;

  return {
    available: true,
    firstPeriodAverage: firstAverage,
    secondPeriodAverage: secondAverage,
    percentChange,
    direction:
      percentChange > 0
        ? "increase"
        : percentChange < 0
        ? "decrease"
        : "unchanged",
  };
};

// Calculate sleep summary statistics
export const calculateSleepSummary = (data: FusionHealthDataset[]) => {
  const sleepData = data.filter(
    (d) => d.sleepSummary && Object.keys(d.sleepSummary.sources).length > 0
  );

  if (sleepData.length === 0) return { available: false };

  // Extract sleep durations
  let totalSleepMinutes = 0;
  let sleepEntries = 0;

  sleepData.forEach((day) => {
    Object.values(day.sleepSummary.sources).forEach((source: any) => {
      const isOura = source.sourceName.toLowerCase().includes("oura");
      const stages = source.stages;

      if (isOura) {
        // For Oura, sum up core, rem, and deep sleep
        const totalSeconds =
          (stages["CORE"] || 0) + (stages["REM"] || 0) + (stages["DEEP"] || 0);
        totalSleepMinutes += totalSeconds / 60;
        sleepEntries++;
      } else {
        // For other sources like Apple Health, use ASLEEP
        const totalSeconds = stages["ASLEEP"] || 0;
        totalSleepMinutes += totalSeconds / 60;
        sleepEntries++;
      }
    });
  });

  return {
    available: true,
    averageDuration:
      sleepEntries > 0 ? totalSleepMinutes / sleepEntries / 60 : 0, // in hours
    daysTracked: sleepData.length,
  };
};

// Calculate steps summary statistics
export const calculateStepsSummary = (data: FusionHealthDataset[]) => {
  const stepsData = data.filter(
    (d) => d.stepSummary && d.stepSummary.totalSteps > 0
  );

  if (stepsData.length === 0) return { available: false };

  const totalSteps = stepsData.reduce(
    (sum, day) => sum + day.stepSummary.totalSteps,
    0
  );
  const average = totalSteps / stepsData.length;

  return {
    available: true,
    averageSteps: average,
    daysTracked: stepsData.length,
  };
};

// Calculate heart rate summary statistics
export const calculateHeartRateSummary = (data: FusionHealthDataset[]) => {
  const heartRateData = data.filter(
    (d) =>
      d.heartRateSummary &&
      d.heartRateSummary.morning > 0 &&
      d.heartRateSummary.afternoon > 0 &&
      d.heartRateSummary.night > 0
  );

  if (heartRateData.length === 0) return { available: false };

  const averageMorningHR =
    heartRateData.reduce(
      (sum, day) => sum + (day.heartRateSummary?.morning || 0),
      0
    ) / heartRateData.length;

  const averageAfternoonHR =
    heartRateData.reduce(
      (sum, day) => sum + (day.heartRateSummary?.afternoon || 0),
      0
    ) / heartRateData.length;

  const averageNightHR =
    heartRateData.reduce(
      (sum, day) => sum + (day.heartRateSummary?.night || 0),
      0
    ) / heartRateData.length;

  const averageHR =
    (averageMorningHR + averageAfternoonHR + averageNightHR) / 3;

  return {
    available: true,
    averageHeartRate: averageHR,
    averageMorningHeartRate: averageMorningHR,
    averageAfternoonHeartRate: averageAfternoonHR,
    averageNightHeartRate: averageNightHR,
    daysTracked: heartRateData.length,
  };
};
