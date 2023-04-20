import React from "react";
import { StyleSheet, Text, View, Button, Alert, FlatList } from "react-native";

import {
  AuthorizationPermissions,
  FitnessDataType,
  FitnessTracker,
  GoogleFitDataType,
  HealthKitDataType,
  HealthKit,
  HealthKitWriteData,
  HealthKitUnitType,
} from "@kilohealth/rn-fitness-tracker";

const permissions = {
  healthReadPermissions: [
    HealthKitDataType.HeartRate,
    HealthKitDataType.StepCount,
    HealthKitDataType.Workout,
  ],
  healthWritePermissions: [
    HealthKitDataType.HeartRate,
    HealthKitDataType.StepCount,
    HealthKitDataType.Workout,
  ],
  // googleFitReadPermissions: [GoogleFitDataType.Steps],
  // googleFitWritePermissions: [GoogleFitDataType.Steps],
};

export function HealthScreen({ navigation, route }) {
  React.useEffect(() => {
    const getStepsToday = async () => {
      try {
        const authorized = await FitnessTracker.authorize(permissions);

        if (!authorized) return;

        const stepsToday = await FitnessTracker.getStatisticTodayTotal(
          FitnessDataType.Steps
        );

        // returns the number of steps walked today, e.g. 320
        console.log(stepsToday);
      } catch (error) {
        // Handle error here
        console.log(error);
      }
    };
    getStepsToday();
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
