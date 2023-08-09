import dayjs from "dayjs";
import PapaParse from "papaparse";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  ScrollView,
} from "react-native";

import { PromptResponse } from "~/@types";
import { Button, Input, Screen } from "~/components";
import { AccountContext } from "~/contexts/account.context";
import { promptService } from "~/services";
import { appInsights, maskPromptId, saveFileToDevice } from "~/utils";

export function AccountScreen() {
  const [feedbackText, setFeedbackText] = React.useState("");

  const accountContext = React.useContext(AccountContext);

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Account",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });
  }, []);

  const exportData = async (dataType: string) => {
    // get all the available prompts
    // get all the responses
    // TODO: have user select what prompts to share
    try {
      const prompts = await promptService.readSavedPrompts();
      if (!prompts || prompts.length < 1) {
        Alert.alert("No prompts to export");
        return;
      }

      const exportTimestamp = dayjs().startOf("day").unix().toString();
      if (dataType === "prompts") {
        console.log("exporting prompts");
        const formatPromptInfo = prompts.map(async (prompt) => {
          prompt.uuid = await maskPromptId(prompt.uuid);
          prompt.notificationConfig_days = JSON.stringify(
            prompt.notificationConfig_days
          );
          prompt.additionalMeta = JSON.stringify(prompt.additionalMeta);
        });
        await Promise.all(formatPromptInfo);
        const promptsCsv = PapaParse.unparse(prompts);
        const promptsLocalPath = await saveFileToDevice(
          `fusionPrompts_${exportTimestamp}.csv`,
          promptsCsv,
          true
        );
      } else if (dataType === "responses") {
        console.log("exporting responses");
        // generare & write response_<timestamp>.csv
        const combinedResponses: PromptResponse[] = [];
        await promptService.processPromptResponses(prompts, combinedResponses);
        const promptResponsesCsv = PapaParse.unparse(combinedResponses);
        const responsesLocalPath = await saveFileToDevice(
          `fusionResponses_${exportTimestamp}.csv`,
          promptResponsesCsv,
          true
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ width: "100%" }}
            className="mt-10"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "center" }}>
              <Text className="font-sans text-center text-base text-white">
                Hey there, you're using Fusion anonymously!
              </Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text className="font-sans text-center text-base text-white">
                We value your privacy and data security.{"\n"}Your prompts and
                responses are stored solely on your device, not our servers.
                {"\n\n"}Rest assured, your entries remain private and
                inaccessible to anyone else unless you decide to share them.
              </Text>
            </View>

            {/* Feedback component */}
            <View className="mt-8">
              <Input
                multiline
                numberOfLines={4}
                onChangeText={setFeedbackText}
                placeholder="Have an idea for something you'd like to see? Or question? Type in here!"
                value={feedbackText}
                className="pt-3 leading-1.5 mb-8"
                style={{ height: 112 }}
              />

              <Button
                title="Send Feedback"
                onPress={async () => {
                  // send feedback
                  const recipient = "contact@usefusion.app";
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
                          setFeedbackText("");
                          Linking.openURL(mailtoUrl);
                        },
                      },
                    ]
                  );
                }}
                fullWidth
              />
            </View>

            <Button
              title="Join a user testing session!"
              onPress={async () => {
                Linking.openURL(
                  "https://calendly.com/oreogundipe/chat-about-fusion"
                );
              }}
              fullWidth
              className="mt-5"
            />

            {/* Export Data */}
            <View className="mt-10">
              <Button
                title="Export Prompts"
                variant="ghost"
                fullWidth
                onPress={async () => await exportData("prompts")}
              />
              <Button
                title="Export Responses"
                variant="ghost"
                fullWidth
                onPress={async () => await exportData("responses")}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    alignItems: "center",
    padding: 10,
  },
});
