import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TextInput,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import logo from "./assets/icon.png";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import * as Notifications from "expo-notifications";

function LogoTitle() {
  return <Image source={logo} style={{ width: 35, height: 35 }} />;
}

function HomeScreen({ navigation, route }) {
  const [savedPrompts, setSavedPrompts] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const res = await readSavedPrompts();
      if (res) {
        setSavedPrompts(res);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 15 }}>
          Track your daily activities by answering personalized prompts that
          enable you to observe your behavioral patterns over time.
        </Text>
      </View>

      {/* Events div  */}
      <Text style={{ fontWeight: "bold", fontSize: "30" }}>Prompts</Text>
      {/* if there were events list them */}
      {savedPrompts ? (
        <FlatList
          data={savedPrompts}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text>Prompt Text: {item.promptText}</Text>
                <Text>Response Type: {item.responseType}</Text>
                <Text>
                  Frequency: {item.notificationFrequency.value}{" "}
                  {item.notificationFrequency.unit}
                </Text>
              </View>

              {/* Edit/Delete/View Prompt responses */}
              <View>
                <Button
                  title="Edit"
                  onPress={() =>
                    navigation.navigate("AuthorPrompt", {
                      prompt: item,
                    })
                  }
                />
                <Button
                  title="Delete"
                  onPress={() => {
                    Alert.alert(
                      "Delete Prompt",
                      "Are you sure you want to delete this prompt?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "OK",
                          onPress: async () => {
                            const res = await deletePrompt(item.uuid);
                            if (res) {
                              setSavedPrompts(res);
                            }
                          },
                        },
                      ]
                    );
                  }}
                />
                <Button
                  title="View Responses"
                  onPress={() =>
                    navigation.navigate("ViewResponses", {
                      prompt: item,
                    })
                  }
                />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.uuid}
        />
      ) : (
        <Text>None configured yet...</Text>
      )}

      <View>
        <Button
          title="Add new prompt"
          onPress={() => navigation.navigate("AuthorPrompt")}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function PromptScreen({ navigation, route }) {
  const [promptObject, setPromptObject] = React.useState(null);
  const [promptText, setPromptText] = React.useState("");

  const [responseTypeOpen, setResponseTypeOpen] = React.useState(false);
  const [responseType, setResponseType] = React.useState(null);
  const [responseTypeItems, setResponseTypeItems] = React.useState([
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Yes/No", value: "yesno" },
    // { label: "Custom Options", value: "customOptions" },
  ]);

  const [notificationFrequencyOpen, setNotificationFrequencyOpen] =
    React.useState(false);
  const [notificationFrequencyUnit, setNotificationFrequencyUnit] =
    React.useState(null);
  const [notificationFrequencyValue, setNotificationFrequencyValue] =
    React.useState(null);
  const [notificationFrequencyItems, setNotificationFrequencyItems] =
    React.useState([
      { label: "Days", value: "days" },
      { label: "Hours", value: "hours" },
      { label: "Minutes", value: "minutes" },
    ]);

  // set the prompt object if it was passed in
  React.useEffect(() => {
    if (route.params && route.params.prompt) {
      setPromptObject(route.params.prompt);
      setPromptText(route.params.prompt.promptText);
      setResponseType(route.params.prompt.responseType);
      setNotificationFrequencyUnit(
        route.params.prompt.notificationFrequency.unit
      );
      setNotificationFrequencyValue(
        route.params.prompt.notificationFrequency.value
      );
    }
  }, [route.params]);

  // TODO: add a way to add custom options

  const onResponseTypeOpen = React.useCallback(() => {
    setNotificationFrequencyOpen(false);
  }, []);

  const onNotificationFrequencyOpen = React.useCallback(() => {
    setResponseTypeOpen(false);
  }, []);

  async function savePrompt() {
    if (
      !promptText ||
      !responseType ||
      !notificationFrequencyValue ||
      !notificationFrequencyUnit
    ) {
      console.log("missing values");
      return;
    }

    try {
      // build the prompt object
      const prompt = {
        uuid: promptObject ? promptObject.uuid : uuidv4(),
        promptText: promptText,
        responseType: responseType,
        notificationFrequency: {
          value: notificationFrequencyValue,
          unit: notificationFrequencyUnit,
        },
      };

      // save/update prompts
      // get the current prompts
      let currentPrompts = await readSavedPrompts();
      let promptIndex = -1;
      if (currentPrompts) {
        // Check if prompt with same UUID already exists in the array
        promptIndex = currentPrompts.findIndex((p) => p.uuid === prompt.uuid);
      } else {
        // if there are no prompts, create an empty array
        currentPrompts = [];
      }

      if (promptIndex >= 0) {
        // Overwrite existing prompt with the same UUID
        currentPrompts[promptIndex] = prompt;
      } else {
        // add the new prompt to the array
        currentPrompts.push(prompt);
      }

      // update the prompts
      await AsyncStorage.setItem("prompts", JSON.stringify(currentPrompts));
      return currentPrompts;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  return (
    <View style={styles.container}>
      <>
        <Text>
          Try to think of something that interests you and write a question
          about it. For example, "Are you feeling energetic?", "Have you had a
          meal?"
        </Text>
      </>

      <View style={styles.formSection} zIndex={3000}>
        <Text>Prompt Text</Text>
        <TextInput
          multiline
          placeholder="e.g How are you feeling about work?"
          style={styles.input}
          value={promptText}
          onChangeText={setPromptText}
        />

        <Text>Response Type</Text>
        {/* select button */}
        <DropDownPicker
          open={responseTypeOpen}
          value={responseType}
          items={responseTypeItems}
          setOpen={setResponseTypeOpen}
          onOpen={onResponseTypeOpen}
          placeholder="Select Response Type"
          setValue={setResponseType}
          setItems={setResponseTypeItems}
        />

        <Text>How often do you want to be prompted?</Text>
        {/* select drop down */}
        {/* the other part should be the unit  - days, hours, minutes */}
        {/* allow configure based on number of */}
        <View style={styles.frequencyContainer}>
          <TextInput
            inputMode="numeric"
            keyboardType="numeric"
            placeholder="8"
            style={styles.frequencyValueInput}
            value={notificationFrequencyValue}
            onChangeText={setNotificationFrequencyValue}
          />
          <DropDownPicker
            open={notificationFrequencyOpen}
            value={notificationFrequencyUnit}
            items={notificationFrequencyItems}
            setOpen={setNotificationFrequencyOpen}
            onOpen={onNotificationFrequencyOpen}
            placeholder="Set Frequency"
            setValue={setNotificationFrequencyUnit}
            setItems={setNotificationFrequencyItems}
            containerStyle={styles.frequencyDropDown}
          />
        </View>
      </View>

      <View zIndex={2000}>
        <Button
          title="Save Prompt"
          onPress={async () => {
            // TODO: trigger function to save
            // Pass and merge params back to home screen
            try {
              const res = await savePrompt();

              if (res) {
                navigation.navigate("Home", {
                  prompts: res,
                });
              } else {
                Alert.alert("Error", "There was an error saving the prompt");
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </View>
    </View>
  );
}

const readSavedPrompts = async () => {
  try {
    const prompts = await AsyncStorage.getItem("prompts");
    if (prompts !== null) {
      // value previously stored
      console.log(prompts);
      const promptArray = JSON.parse(prompts);
      return promptArray;
    }
  } catch (e) {
    // error reading value
    return null;
  }
};

const deletePrompt = async (uuid) => {
  try {
    const prompts = await AsyncStorage.getItem("prompts");
    if (prompts !== null) {
      // value previously stored
      console.log(prompts);
      const promptArray = JSON.parse(prompts);
      const newPromptArray = promptArray.filter(
        (prompt) => prompt.uuid !== uuid
      );
      await AsyncStorage.setItem("prompts", JSON.stringify(newPromptArray));
      return newPromptArray;
    }
  } catch (e) {
    // error reading value
    return null;
  }
};

const saveFusionEvent = async (eventObj) => {
  // TODO: update to also store data remotely
  // first fetch events in local storage
  try {
    const events = await AsyncStorage.getItem("events");
    if (events !== null) {
      // value previously stored
      console.log(events);
      const eventArray = JSON.parse(events);
      eventArray.push(eventObj);
      await AsyncStorage.setItem("events", JSON.stringify(eventArray));
      return eventArray;
    } else {
      const newEvents = [];
      newEvents.push(eventObj);
      await AsyncStorage.setItem("events", JSON.stringify(newEvents));
      return newEvents;
    }
  } catch (e) {
    // error reading value
    console.log("failed to save event value");
    return null;
  }
};

const Stack = createNativeStackNavigator();

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert("Error", "Failed to get push token for push notification!");
    return false;
  }

  return true;
};

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

// TODO: set cutom catgeories based on prompts
Notifications.setNotificationCategoryAsync("yesno", [
  {
    identifier: "Yes",
    buttonTitle: "Yes",
  },
  {
    identifier: "No",
    buttonTitle: "No",
  },
]);

Notifications.setNotificationCategoryAsync("number", [
  {
    identifier: "number",
    buttonTitle: "Respond",
    textInput: {
      submitButtonTitle: "Log",
      placeholder: "Enter a number",
    },
  },
]);

Notifications.setNotificationCategoryAsync("text", [
  {
    identifier: "text",
    buttonTitle: "Respond",
    textInput: {
      submitButtonTitle: "Log",
      placeholder: "Type your response here",
    },
  },
]);

export default function App() {
  const responseListener = React.useRef();

  React.useEffect(() => {
    // validate permission status for user
    (async () => {
      const permissionStatus = await registerForPushNotificationsAsync();
      if (!permissionStatus) {
        console.log("Not registered for push notifications");
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      // get the list of active prompts and schedule notifications
      // TODO: check if the notification is already scheduled  - if so, skip (hack is to clear all notifcations & reset every time)
      const prompts = await readSavedPrompts();
      if (prompts) {
        prompts.forEach(async (prompt) => {
          // convert prompt interval to seconds
          let promptIntervalSeconds;
          switch (prompt.notificationFrequency.unit) {
            case "hours":
              promptIntervalSeconds = prompt.notificationFrequency.value * 3600;
              break;
            case "minutes":
              promptIntervalSeconds = prompt.notificationFrequency.value * 60;
              break;
            case "days":
              promptIntervalSeconds =
                prompt.notificationFrequency.value * 86400;
              break;
          }

          console.log("promptIntervalSeconds", promptIntervalSeconds);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Fusion: ${prompt.promptText}`,
              body: "Press & hold to log",
              categoryIdentifier: prompt.responseType,
            },
            trigger: {
              repeats: true,
              seconds: promptIntervalSeconds,
            },
          });
        });
      }
    })();

    // set notification handlers
    (async () => {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("notification response");
          console.log(response.notification);

          let eventObj = {
            name: response.notification.request.content.title,
            description: response.notification.request.content.title,
          };
          const notificationCategory =
            response.notification.request.content.categoryIdentifier;

          // if no response do nothing
          if (
            response.actionIdentifier == Notifications.DEFAULT_ACTION_IDENTIFIER
          ) {
            return;
          }

          if (notificationCategory == "yesno") {
            eventObj["value"] = response.actionIdentifier;
          } else if (
            notificationCategory == "text" ||
            notificationCategory == "number"
          ) {
            eventObj["value"] = response.userText;
          }

          const fusionEvent = {
            startTimestamp: Math.floor(response.notification.date),
            endTimestamp: Math.floor(response.notification.date),
            event: eventObj,
          };

          // save locally
          (async () => {
            console.log(await saveFusionEvent(fusionEvent));
          })();

          console.log("saved fusion event");
        });
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
        />
        <Stack.Screen
          name="AuthorPrompt"
          component={PromptScreen}
          options={{ title: "Author Prompt" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    // justifyContent: "center",
    padding: 10,
  },
  input: {
    height: 50,
    // margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    lineHeight: 25,
  },
  formSection: {
    width: "100%",
    padding: 10,
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  frequencyValueInput: {
    width: "20%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  frequencyDropDown: {
    width: "80%",
  },
  item: {
    // padding: 10,
    // fontSize: 18,
    margin: 10,
  },
});
