import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React from "react";
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
  Pressable,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

import { Prompt, PromptResponseType } from "~/@types";
import { TimePicker } from "~/components/timepicker";
import { usePrompts } from "~/hooks";
import { RouteProp, PromptScreenNavigationProp } from "~/navigation";
import { promptService } from "~/services";
import { getDayjsFromTimestring, appInsights } from "~/utils";

export function PromptScreen() {
  const route = useRoute<RouteProp<"AuthorPrompt">>();
  const navigation = useNavigation<PromptScreenNavigationProp>();
  const { setSavedPrompts } = usePrompts();

  const [promptObject, setPromptObject] = React.useState<Prompt | null>(null);
  const [promptText, setPromptText] = React.useState("");
  const [customOptionsInputText, setcustomOptionsInputText] =
    React.useState("");
  const [responseTypeOpen, setResponseTypeOpen] = React.useState(false);
  const [responseType, setResponseType] =
    React.useState<PromptResponseType | null>(null);
  const [responseTypeItems, setResponseTypeItems] = React.useState([
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Yes/No", value: "yesno" },
    { label: "Custom Options", value: "customOptions" },
  ]);

  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  React.useEffect(() => {
    setCustomOptions(customOptionsInputText.split(" ").join("").split(";")); // semicolon seperated parsing into CustomOptions List
  }, [customOptionsInputText]);

  const [countPerDay, setCountPerDay] = React.useState<string | undefined>(
    undefined
  );
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
    appInsights.trackPageView({
      name: "Author Prompt",
      properties: {
        intent: route.params?.prompt ? "edit" : "create",
      },
    });

    if (route.params?.prompt) {
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

      if (route.params.prompt.additionalMeta?.customOptionText) {
        setcustomOptionsInputText(
          route.params.prompt.additionalMeta?.customOptionText
        );
      }
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
          <Pressable style={[styles.formSection, { zIndex: 10000 }]}>
            <View style={styles.formComponent}>
              <Text>Prompt Text</Text>
              <TextInput
                placeholder="e.g How are you feeling about work?"
                style={styles.input}
                value={promptText}
                onChangeText={setPromptText}
              />
            </View>

            <View style={[styles.formComponent, { zIndex: 5000 }]}>
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

            {responseType === "customOptions" ? (
              <View style={styles.formComponent}>
                <Text>Add options below and seperate them with ';'</Text>

                <TextInput
                  placeholder="e.g Energetic;Neutral;Tired"
                  style={styles.input}
                  value={customOptionsInputText}
                  onChangeText={setcustomOptionsInputText}
                />

                {customOptions.map((option) => (
                  <View key={option} style={{ marginTop: 5 }}>
                    <Text style={[styles.customOptionsListItem]}>{option}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.formComponent}>
              <View style={styles.frequencyContainer}>
                <Text>How many times?</Text>
                <TextInput
                  value={countPerDay}
                  inputMode="numeric"
                  keyboardType="numeric"
                  placeholder="e.g 3"
                  style={styles.frequencyValueInput}
                  onChangeText={setCountPerDay}
                />
              </View>
            </View>

            <TimePicker
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              days={days}
              setDays={setDays}
            />
          </Pressable>
        </ScrollView>

        <View style={{ zIndex: 2000 }}>
          <Button
            title="Save Prompt"
            onPress={async () => {
              try {
                // if there is a prompt object, then we are editing an existing prompt
                const promptUuid = promptObject ? promptObject.uuid : null;

                if (start >= end) {
                  throw new Error("Start time must be before end time");
                }

                if (promptText === "") {
                  throw new Error("Prompt text cannot be empty");
                }

                if (responseType == null) {
                  throw new Error("Response type cannot be empty");
                }

                if (countPerDay === "") {
                  throw new Error("Count per day cannot be empty");
                }

                let additionalMeta = {};
                if (responseType === "customOptions") {
                  additionalMeta = {
                    customOptionText: customOptionsInputText,
                  };

                  if (new Set(customOptions).size !== customOptions.length) {
                    throw new Error("Duplicates in custom prompt");
                  }
                  if (customOptions.includes("")) {
                    throw new Error("Empty entry in custom prompts");
                  }
                  if (customOptions.length < 2) {
                    throw new Error("At least two custom prompts are required");
                  }
                }

                console.log("calling save prompt");

                const res = await promptService.savePrompt({
                  uuid: promptUuid,
                  promptText,
                  responseType: responseType!,
                  notificationConfig_countPerDay: parseInt(
                    countPerDay ?? "0",
                    10
                  ),
                  notificationConfig_startTime: start.format("HH:mm"),
                  notificationConfig_endTime: end.format("HH:mm"),
                  notificationConfig_days: days,
                  additionalMeta,
                });

                if (res) {
                  // read the saved prompts from the db
                  const savedPrompts = await promptService.readSavedPrompts();

                  if (savedPrompts) {
                    // update the saved prompts state
                    setSavedPrompts(savedPrompts);
                    // Let the user know the prompt was saved
                    Alert.alert("Success", "Prompt saved successfully");

                    // navigate back to the home screen
                    navigation.navigate("Prompts");
                  } else {
                    throw new Error("There was an error reading the prompts");
                  }
                } else {
                  throw new Error("There was an error saving the prompt");
                }
              } catch (error) {
                Alert.alert("Error", String(error));
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
    padding: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
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
    margin: 10,
  },
  formComponent: {
    marginTop: 10,
  },
  customOptionsListItem: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    padding: 3,
    paddingLeft: 10,
  },
});
