import React from "react";
import { StyleSheet, Text, View, Button, Alert, TextInput } from "react-native";
import * as MailComposer from "expo-mail-composer";
import appInsights from "../utils/appInsights";
import { resyncOldPrompts } from "../utils";

export function AccountScreen({ navigation, route }) {
  const [feedbackText, setFeedbackText] = React.useState("");

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Account",
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hey there, you're currently using Fusion anonymously!</Text>
      <Text>(more personalization features to come in the future)</Text>

      <Button
        title="Resync missing Prompts / Responses"
        onPress={() => {
          Alert.alert("Resync", "Are you sure you want to resync your data?", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: async () => {
                await resyncOldPrompts();
              },
            },
          ]);
        }}
      ></Button>

      <View style={styles.formSection}>
        <View style={styles.formHeader}>
          <Text style={{ fontWeight: "bold", fontSize: 30, marginTop: 10 }}>
            Feedback
          </Text>
          <Text>Help shape how we build!</Text>
        </View>

        <TextInput
          multiline
          placeholder="Have an idea for a new feature? Or question? Type in here!"
          style={styles.input}
          value={feedbackText}
          onChangeText={setFeedbackText}
        />
        <Button
          title="Send Feedback"
          onPress={async () => {
            // send feedback
            const mailStatus = await MailComposer.composeAsync({
              recipients: ["ore@usefusion.app"],
              subject: "Fusion Feedback",
              body: feedbackText,
            });

            if (mailStatus.status === MailComposer.MailComposerStatus.SENT) {
              Alert.alert(
                "Feedback sent!",
                "Thanks for your feedback! We'll get back to you shortly."
              );
              setFeedbackText("");
            }
          }}
        ></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 10,
  },
  input: {
    height: 150,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    lineHeight: 25,
  },
  formHeader: {
    alignItems: "center",
  },
  formSection: {
    width: "100%",
    padding: 10,
  },
});
