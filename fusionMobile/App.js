import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import logo from "./assets/logo.png";

export default function App() {
  return (
    <View style={styles.container}>
      {/* Add logo here */}
      <Text>Welcome to Fusion</Text>

      <Text>
        Core concepts is that you get reminders about events and you respond
      </Text>

      {/* Would you like us to prompt you at intervals to tell us what you're doing? */}

      {/* question, cadence, input */}

      {/* Add button to get started or just show them */}
      <StatusBar style="auto" />
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
