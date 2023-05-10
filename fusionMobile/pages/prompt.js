import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

import {
  PromptContext,
  readSavedPrompts,
  savePrompt,
  getDayjsFromTimestring,
} from "../utils";
import { TimePicker } from "../components/timepicker.js";

import dayjs from "dayjs";
import appInsights from "../utils/appInsights";

export function PromptScreen({ navigation, route }) {
  const { setSavedPrompts } = React.useContext(PromptContext);

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

  const [countPerDay, setCountPerDay] = React.useState(null);
  const [days, setDays] = React.useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  const [start, setStart] = React.useState(
    dayjs().startOf("day").add(8, "hour")
  );
  const [end, setEnd] = React.useState(
    start.endOf("day").subtract(2, "hour").add(1, "minute")
  );

  // set the prompt object if it was passed in (this is for editing)
  React.useEffect(() => {
    if (route.params && route.params.prompt) {
      setPromptObject(route.params.prompt);
      setPromptText(route.params.prompt.promptText);
      setResponseType(route.params.prompt.responseType);
      if (route.params.prompt.notificationConfig_countPerDay) {
        setCountPerDay(
          route.params.prompt.notificationConfig_countPerDay.toString()
        );
      }
      if (route.params.prompt.notificationConfig_days) {
        if (typeof route.params.prompt.notificationConfig_days === "string") {
          const days = JSON.parse(route.params.prompt.notificationConfig_days);
          setDays(days);
        } else {
          setDays(route.params.prompt.notificationConfig_days);
        }
      }
      if (route.params.prompt.notificationConfig_startTime) {
        setStart(
          getDayjsFromTimestring(
            route.params.prompt.notificationConfig_startTime
          )
        );
      }
      if (route.params.prompt.notificationConfig_endTime) {
        setEnd(
          getDayjsFromTimestring(route.params.prompt.notificationConfig_endTime)
        );
      }

      appInsights.trackPageView({
        name: "Author Prompt",
        properties: {
          intent: "edit",
        },
      });
    } else {
      appInsights.trackPageView({
        name: "Author Prompt",
        properties: {
          intent: "create",
        },
      });
    }
  }, [route.params]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <>
          <Text>
            Think of something that interests you and write a question about it.
            {"\n\n"}E.g: "Are you feeling energetic?", "Have you had a meal?"
          </Text>
        </>

        <ScrollView
          style={{
            width: "100%",
          }}
          horizontal={false} // Set horizontal prop to false to disable horizontal scrolling
          contentContainerStyle={{ flexGrow: 1 }} // Set flexGrow to 1 to enable vertical scrolling
        >
          <View style={styles.formSection} zIndex={10000}>
            <View style={styles.formComponent}>
              <Text>Prompt Text</Text>
              <TextInput
                multiline
                placeholder="e.g How are you feeling about work?"
                style={styles.input}
                value={promptText}
                onChangeText={setPromptText}
              />
            </View>

            <View style={styles.formComponent} zIndex={5000}>
              <Text>Response Type</Text>
              {/* select button */}
              <DropDownPicker
                open={responseTypeOpen}
                value={responseType}
                items={responseTypeItems}
                setOpen={setResponseTypeOpen}
                placeholder="Select Response Type"
                setValue={setResponseType}
                setItems={setResponseTypeItems}
              />
            </View>

            <View style={styles.formComponent}>
              <View style={styles.frequencyContainer}>
                <Text>How many times?</Text>
                <TextInput
                  value={countPerDay}
                  inputMode="numeric"
                  keyboardType="numeric"
                  placeholder="3"
                  style={styles.frequencyValueInput}
                  onChangeText={setCountPerDay}
                />
              </View>
            </View>

            <TimePicker
              styles={styles.formComponent}
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              days={days}
              setDays={setDays}
            />
          </View>
        </ScrollView>

        <View zIndex={2000}>
          <Button
            title="Save Prompt"
            onPress={async () => {
              try {
                // if there is a prompt object, then we are editing an existing prompt
                const promptUuid = promptObject ? promptObject.uuid : null;

                if (start >= end) {
                  Alert.alert(
                    "Error",
                    "The start time must be before the end time"
                  );
                  return;
                }

                const res = await savePrompt(
                  promptText,
                  responseType,
                  countPerDay,
                  start.format("HH:mm"),
                  end.format("HH:mm"),
                  days,
                  promptUuid
                );

                if (res) {
                  // read the saved prompts from the db
                  const savedPrompts = await readSavedPrompts();

                  if (savedPrompts) {
                    // update the saved prompts state
                    setSavedPrompts(savedPrompts);
                    // Let the user know the prompt was saved
                    Alert.alert("Success", "Prompt saved successfully");

                    // navigate back to the home screen
                    navigation.navigate("Home");
                  } else {
                    throw new Error("There was an error reading the prompts");
                  }
                } else {
                  throw new Error("There was an error saving the prompt");
                }
              } catch (error) {
                Alert.alert("Error", "There was an error saving the prompt");
                console.log(error);
              }
            }}
          />
        </View>

        {/* {!route.params?.prompt && (
        <View>
          <Text>Or, chose prompt from preset options</Text>
        </View>
      )} */}
      </View>
    </TouchableWithoutFeedback>
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
  formComponent: {
    marginTop: 10,
  },
});
