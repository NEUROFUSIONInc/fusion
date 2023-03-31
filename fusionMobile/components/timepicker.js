import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

export function TimePicker() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const [days, setDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const dayLabels = {
    monday: "Mon",
    tuesday: "Tues",
    wednesday: "Wed",
    thursday: "Thur",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  const [isStartTimePickerVisible, setStartTimePickerVisibility] =
    useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };
  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };
  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };
  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (selectedTime) => {
    console.warn("startTime has been picked: ", selectedTime);
    const currentTime = selectedTime || start;
    setStart(currentTime);
    hideStartTimePicker();
  };
  const handleEndTimeConfirm = (selectedTime) => {
    console.warn("startTime has been picked: ", selectedTime);
    const currentTime = selectedTime || end;
    setEnd(currentTime);
    hideEndTimePicker();
  };

  return (
    <View style={styles.container}>
      {/* <Text>Between</Text> */}
      <TouchableOpacity style={styles.timePicker} onPress={showStartTimePicker}>
        <Text>From</Text>
        <View>
          <Text>
            {start.toLocaleTimeString()}
            <MaterialCommunityIcons name="menu-right" size={15} />
          </Text>
        </View>
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="time"
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.timePicker} onPress={showEndTimePicker}>
        <Text>To</Text>
        <Text>
          {end.toLocaleTimeString()}
          <MaterialCommunityIcons name="menu-right" size={15} />
        </Text>

        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="time"
          onConfirm={handleEndTimeConfirm}
          onCancel={hideEndTimePicker}
        />
      </TouchableOpacity>

      <View style={styles.daysContainer}>
        <Text>Days of week</Text>

        <View style={styles.checkBoxGroup}>
          {Object.keys(days).map((day) => (
            <View style={styles.checkBoxRow} key={Math.random()}>
              <Checkbox
                value={days[day]}
                onValueChange={(value) => setDays({ ...days, [day]: value })}
              />
              <Text style={styles.checkBoxLabel}>{dayLabels[day]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  timePicker: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  daysContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkBoxGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  checkBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  checkBoxLabel: {
    // fontSize: 16,
    marginLeft: 10,
  },
});
