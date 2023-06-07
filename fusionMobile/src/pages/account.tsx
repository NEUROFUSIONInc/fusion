import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
} from "react-native";

import {
  appInsights,
  createNostrAccount,
  getNostrAccount,
  // relay,
} from "~/utils";

import axios from "axios";

import { generatePrivateKey, getPublicKey, nip19, nip04 } from "nostr-tools";
import { useMemo, useState, useRef } from "react";
import { Pressable } from "react-native";

// import crypto from "isomorphic-webcrypto";

export function AccountScreen() {
  const [feedbackText, setFeedbackText] = React.useState("");

  const [nostrAccount, setNostrAccount] = React.useState<{
    npub: string;
    pubkey: string;
    privkey: string;
  } | null>(null);

  const now = useRef(Date.now());

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "Account",
    });

    (async () => {
      setNostrAccount(await getNostrAccount());
      setBrainRecordingEnabled(await getResearchProgramStatus());
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      if (!nostrAccount) {
        // generate a new account for user
        const privkey = generatePrivateKey();

        const pubkey = getPublicKey(privkey);
        const npub = nip19.npubEncode(pubkey);

        const saveStatus = await createNostrAccount(npub, pubkey, privkey);
        if (saveStatus) {
          setNostrAccount(await getNostrAccount());
        }
      } else {
        // let's query for an event that exists
        // try {
        //   // await crypto.ensureSecure();
        //   await relay.connect();
        //   let sub = relay.sub(
        //     [
        //       {
        //         kinds: [4],
        //         "#p": [nostrAccount.pubkey],
        //         since: Math.floor(now.current / 1000),
        //       },
        //     ],
        //     {}
        //   );
        //   sub.on("event", async (event) => {
        //     console.log("we got the event we wanted:", event);
        //     console.log("decoding...");
        //     const decoded = await nip04.decrypt(
        //       nostrAccount.privkey,
        //       "fdf7a56cb4113a3a520cad232959838ccc907b593c9f8871e5cce86b18cd6edd",
        //       event.content
        //     );
        //     console.log("access token", decoded);
        //   });
        // } catch (error) {
        //   console.log(error);
        // }
        // try {
        //   // make api call to backend server to get a token for account
        //   const res = await axios.post("http://localhost:4000/api/nostrlogin", {
        //     pubkey: nostrAccount.pubkey,
        //   });
        //   console.log(res.status);
        //   console.log(res.data);
        // } catch (error) {
        //   console.log(error);
        // }
        // store the authToken in secure store
      }
    })();
  }, [nostrAccount]);

  const [brainRecordingEnabled, setBrainRecordingEnabled] =
    React.useState(false);

  const getResearchProgramStatus = async () => {
    const researchProgramMember = await AsyncStorage.getItem(
      "researchProgramMember"
    );

    if (researchProgramMember == "true") {
      return true;
    } else {
      return false;
    }
  };

  const handleBrainRecordingToggle = async () => {
    // toggle brain recording value
    console.log(
      "about to toggle brain recording value from",
      brainRecordingEnabled
    );
    if (brainRecordingEnabled == true) {
      await AsyncStorage.setItem("researchProgramMember", "false");
    } else {
      await AsyncStorage.setItem("researchProgramMember", "true");
    }
    setBrainRecordingEnabled(!brainRecordingEnabled);
  };

  return (
    <KeyboardAvoidingView behavior={"padding"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%" }}>
          <View style={{ alignItems: "center" }}>
            <Text>Hey there, you're using Fusion anonymously!</Text>
          </View>

          {/* Display npub information */}
          {nostrAccount && (
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Your keys",
                  `privateKey: ${nostrAccount.privkey}\n\n\nYou can use this on other Nostr Clients.`
                )
              }
            >
              <View style={styles.formSection}>
                <Text style={{ lineHeight: 30 }}>{nostrAccount.npub}</Text>
              </View>
            </Pressable>
          )}

          {/* Feedback component */}
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
                        setFeedbackText("");
                        Linking.openURL(mailtoUrl);
                      },
                    },
                  ]
                );
              }}
            />
          </View>

          {/* Opt in to Reasearch Program */}
          {/* <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={{ fontWeight: "bold", fontSize: 30, marginTop: 10 }}>
                Research Program
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <Text
                style={{
                  lineHeight: 30,
                }}
              >
                Enable brain recordings
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={brainRecordingEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleBrainRecordingToggle}
                value={brainRecordingEnabled}
              />
            </View>
          </View> */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
