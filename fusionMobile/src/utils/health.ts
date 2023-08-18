import AppleHealthKit from "react-native-health";

/* Permission options */
export const permissions = {
  permissions: {
    read: [
      // AppleHealthKit.Constants.Permissions.HeartRate,
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
      // AppleHealthKit.Constants.Permissions.SleepAnalysis,
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
