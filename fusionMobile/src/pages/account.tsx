import React from "react";
import { StyleSheet, Text, View, Button, Alert, TextInput } from "react-native";
import * as MailComposer from "expo-mail-composer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resyncOldPrompts, appInsights } from "~/utils";
import * as Linking from "expo-linking";

export function AccountScreen() {
  const [feedbackText, setFeedbackText] = React.useState("");
  const [oldPromptExist, setOldPromptExist] = React.useState(false);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Account",
    });
  }, []);

  React.useEffect(() => {
    validatePromptStatus().then((res) => {
      setOldPromptExist(res);
    });
  }, []);

  const validatePromptStatus = async () => {
    const oldPrompts = await AsyncStorage.getItem("prompts");
    if (oldPrompts) {
      const parsedPrompts = JSON.parse(oldPrompts);

      if (parsedPrompts.length > 0) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <Text>Hey there, you're currently using Fusion anonymously!</Text>
      <Text>(more personalization features to come in the future)</Text>

      {/* Resync old prompts */}
      {oldPromptExist && (
        <Button
          title="Resync missing Prompts / Responses"
          onPress={() => {
            Alert.alert(
              "Resync",
              "Are you sure you want to resync your data?",
              [
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
              ]
            );
          }}
        ></Button>
      )}

      <View style={styles.formSection}>
        <View style={styles.formHeader}>
          <Text style={{ fontWeight: "bold", fontSize: 30, marginTop: 10 }}>
            Feedback
          </Text>
          <Text>Help shape how we build!</Text>
        </View>

        <TextInput
          multiline
          placeholder="Have an idea for something you'd like to see? Or question? Type in here!"
          style={styles.input}
          value={feedbackText}
          onChangeText={setFeedbackText}
        />
        <Button
          title="Send Feedback"
          onPress={async () => {
            // send feedback
            const recipient = "ore@usefusion.app";
            const subject = "Fusion Feedback";
            const body = feedbackText;

            const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
              subject
            )}&body=${encodeURIComponent(body)}`;

            Alert.alert(
              "Send Feedback",
              "About to navigate to your mail app. Continue",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: () => {
                    Linking.openURL(mailtoUrl);
                  },
                },
              ]
            );
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
