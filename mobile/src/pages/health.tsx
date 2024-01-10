import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function HealthScreen() {
  React.useEffect(() => {}, []);

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
