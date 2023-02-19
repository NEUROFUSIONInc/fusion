import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Button, TextInput } from "react-native";
import logo from "./assets/icon.png";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import DropDownPicker from "react-native-dropdown-picker";

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={logo} style={{ width: 50, height: 50 }} />
      <Text>
        Log your events and explore how your behavior changes over time as you
        spend your days.
      </Text>

      {/* Events div  */}
      <Text style={{ fontWeight: "bold", fontSize: "30" }}>Events</Text>
      {/* if there were events list them */}
      <Text>No prompts configured yet...</Text>

      <Button
        title="Add a prompt"
        onPress={() => navigation.navigate("CreatePrompt")}
      />
      <StatusBar style="auto" />
    </View>
  );
}

function CreatePromptScreen({ navigation }) {
  const [postText, setPostText] = React.useState("");

  const [responseTypeOpen, setResponseTypeOpen] = React.useState(false);
  const [responseType, setResponseType] = React.useState(null);
  const [responseTypeItems, setResponseTypeItems] = React.useState([
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Yes/No", value: "yesno" },
    { label: "Custom Options", value: "customOptions" },
  ]);

  const [notificationFrequencyOpen, setNotificationFrequencyOpen] =
    React.useState(false);
  const [notificationFrequency, setNotificationFrequency] =
    React.useState(null);
  const [notificationFrequencyValue, setNotificationFrequencyValue] =
    React.useState(null);
  const [notificationFrequencyItems, setNotificationFrequencyItems] =
    React.useState([
      { label: "Days", value: "days" },
      { label: "Hours", value: "hours" },
      { label: "Minutes", value: "minutes" },
    ]);

  // TODO: add a way to add custom options

  const onResponseTypeOpen = React.useCallback(() => {
    setNotificationFrequencyOpen(false);
  }, []);

  const onNotificationFrequencyOpen = React.useCallback(() => {
    setResponseTypeOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <>
        <Text>
          Think of something you'd like to track. Common examples, 'how are you
          feeling', 'have you drank water in last 5hours?'
        </Text>
      </>

      <View style={styles.formSection}>
        <Text>Prompt Text</Text>
        <TextInput
          multiline
          placeholder="e.g How are you feeling about work?"
          style={styles.input}
          value={postText}
          onChangeText={setPostText}
        />

        <Text>Response Type</Text>
        {/* select button */}
        <DropDownPicker
          zIndex={3000}
          zIndexInverse={1000}
          open={responseTypeOpen}
          value={responseType}
          items={responseTypeItems}
          setOpen={setResponseTypeOpen}
          onOpen={onResponseTypeOpen}
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
            zIndex={2000}
            zIndexInverse={2000}
            open={notificationFrequencyOpen}
            value={notificationFrequency}
            items={notificationFrequencyItems}
            setOpen={setNotificationFrequencyOpen}
            onOpen={onNotificationFrequencyOpen}
            placeholder="Set Frequency"
            setValue={setNotificationFrequency}
            setItems={setNotificationFrequencyItems}
            containerStyle={styles.frequencyDropDown}
          />
        </View>
      </View>

      <Button
        title="Save Prompt"
        onPress={() => {
          // TODO: trigger function to save
          // Pass and merge params back to home screen
        }}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Fusion",
          }}
        />
        <Stack.Screen
          name="CreatePrompt"
          component={CreatePromptScreen}
          options={{ title: "Create a Fusion Prompt" }}
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
});
