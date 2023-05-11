import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";

import AppleHealthKit from "react-native-health";

/* Permission options */
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.WalkingHeartRateAverage,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
      AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
      AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      // Sleep
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      // Activity
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.DistanceCycling,
      AppleHealthKit.Constants.Permissions.DistanceSwimming,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.Workout,
      // Mindfulness
      AppleHealthKit.Constants.Permissions.MindfulSession,
    ],
    write: [],
  },
};

export function HealthScreen() {
  React.useEffect(() => {
    // TODO: check the user is on iphone
    if (Platform.OS === "ios") {
      AppleHealthKit.initHealthKit(permissions, error => {
        /* Called after we receive a response from the system */

        if (error) {
          console.log("[ERROR] Cannot grant permissions!");
        }

        /* Can now read or write to HealthKit */

        const options = {
          startDate: new Date(2020, 1, 1).toISOString(),
        };

        AppleHealthKit.getHeartRateSamples(
          options,
          (callbackError, results) => {
            /* Samples are now collected from HealthKit */
          }
        );

        AppleHealthKit.getSleepSamples(options, (callbackError, results) => {
          /* Samples are now collected from HealthKit */
          console.log(results);
          console.log(callbackError);
        });
      });
    } else if (Platform.OS === "android") {
      // use the other library.
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Health Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
