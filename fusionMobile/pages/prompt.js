import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";

import { PromptContext, savePrompt } from "../utils";
import { TimePicker } from "../components/timepicker.js";

import dayjs from "dayjs";

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

  const [notificationFrequencyUnit, setNotificationFrequencyUnit] =
    React.useState(null);
  const [notificationFrequencyValue, setNotificationFrequencyValue] =
    React.useState(3);

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
      setNotificationFrequencyUnit(
        route.params.prompt.notificationFrequency.unit
      );
      setNotificationFrequencyValue(
        route.params.prompt.notificationFrequency.value
      );
    }
  }, [route.params]);

  // TODO: add a way to add custom options

  return (
    <View style={styles.container}>
      <>
        <Text>
          Think of something that interests you and write a question about it.
          {"\n\n"}E.g: "Are you feeling energetic?", "Have you had a meal?"
        </Text>
      </>

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
              inputMode="numeric"
              keyboardType="numeric"
              placeholder="3"
              style={styles.frequencyValueInput}
              value={notificationFrequencyValue}
              onChangeText={setNotificationFrequencyValue}
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

      <View zIndex={2000}>
        <Button
          title="Save Prompt"
          onPress={async () => {
            try {
              // if there is a prompt object, then we are editing an existing prompt
              const promptUuid = promptObject ? promptObject.uuid : null;

              const res = await savePrompt(
                promptText,
                responseType,
                notificationFrequencyValue,
                notificationFrequencyUnit,
                promptUuid
              );

              if (res) {
                // update the saved prompts state
                setSavedPrompts(res);
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

      {/* {!route.params?.prompt && (
        <View>
          <Text>Or, chose prompt from preset options</Text>
        </View>
      )} */}
    </View>
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
