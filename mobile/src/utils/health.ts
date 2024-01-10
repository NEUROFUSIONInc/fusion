import { Dayjs } from "dayjs";
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

export interface healthDataset {
  date: string;
  totalSleep: number;
  totalSteps: number;
}

// build dataset for querying
export const buildHealthDataset = (startDate: Dayjs, endDate: Dayjs) => {
  const dataset: healthDataset[] = [];
  if (Platform.OS === "ios") {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        Alert.alert("Missing permissions", "Cannot grant permissions!");
      }
      /* Can now read or write to HealthKit */
      const options: HealthInputOptions = {
        startDate: startDate.toISOString(),
      };

      endDate && (options.endDate = endDate.toISOString());

      // AppleHealthKit.getSleepSamples(
      //   options,
      //   async (err: any, results: HealthValue[]) => {
      //     if (err) {
      //       return;
      //     }
      //     console.log(results);
      //   }
      // );

      AppleHealthKit.getDailyStepCountSamples(
        options,
        async (err: any, results: HealthValue[]) => {
          if (err) {
          }
          console.log(results);

          // store the total for each day
        }
      );

      // AppleHealthKit.getHeartRateSamples(
      //   options,
      //   async (err: any, results: HealthValue[]) => {
      //     if (err) {
      //     }
      //     // console.log(results);
      //   }
      // );
    });
  }
  return dataset;
};

export const connectAppleHealth = async () => {
  if (Platform.OS === "ios") {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      /* Called after we receive a response from the system */
      if (error) {
        console.log("[ERROR] Cannot grant permissions!");
      }

      /* Can now read or write to HealthKit */
      // const options = {
      //   startDate: dayjs().subtract(30, "day").startOf("day").toISOString(),
      // };

      Alert.alert(
        "Apple Health Connected",
        "We will use your sleep, activity and heart rate over time to personalize your Copilot recommendations"
      );
    });
  }
};
