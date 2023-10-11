import dayjs from "dayjs";
import { Alert, Platform } from "react-native";
import AppleHealthKit from "react-native-health";

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
      // AppleHealthKit.Constants.Permissions.ActivitySummary,
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

export const connectAppleHealth = async () => {
  if (Platform.OS === "ios") {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      /* Called after we receive a response from the system */
      if (error) {
        console.log("[ERROR] Cannot grant permissions!");
      }

      /* Can now read or write to HealthKit */
      const options = {
        startDate: dayjs().startOf("day").toISOString(),
      };

      // AppleHealthKit.getSleepSamples(
      //   options,
      //   async (err: any, results: HealthValue[]) => {
      //     if (err) {
      //       return;
      //     }

      //     await saveFileToDevice(
      //       `fusionSleep.json`,
      //       JSON.stringify(results),
      //       true,
      //       "application/json",
      //       "public.json"
      //     );
      //     // console.log(results);
      //   }
      // );

      // AppleHealthKit.getDailyStepCountSamples(
      //   options,
      //   async (err: any, results: HealthValue[]) => {
      //     if (err) {
      //       return;
      //     }

      //     await saveFileToDevice(
      //       `fusionSteps.json`,
      //       JSON.stringify(results),
      //       true,
      //       "application/json",
      //       "public.json"
      //     );
      //     // console.log(results);
      //   }
      // );

      // AppleHealthKit.getStepCount(options, (err: any, results: HealthValue) => {
      //   if (err) {
      //     return;
      //   }
      //   Alert.alert("Total steps today", `${Math.floor(results.value)} steps`);
      // });

      Alert.alert(
        "Apple Health Connected",
        "We will use your health data to support Copilot recommendations"
      );
    });
  }
};
