import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import dayjs from "dayjs";
import { NotificationConfigDays, Days } from "~/@types";

type TimePickerProps = {
  start: dayjs.Dayjs;
  setStart: (time: dayjs.Dayjs) => void;
  end: dayjs.Dayjs;
  setEnd: (time: dayjs.Dayjs) => void;
  days: NotificationConfigDays;
  setDays: (days: NotificationConfigDays) => void;
};

export function TimePicker({
  start,
  setStart,
  end,
  setEnd,
  days,
  setDays,
}: TimePickerProps) {
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

  const handleStartTimeConfirm = (selectedTime: Date) => {
    console.log("startTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || start;
    setStart(currentTime);
    hideStartTimePicker();
  };
  const handleEndTimeConfirm = (selectedTime: Date) => {
    console.log("endTime has been picked: ", selectedTime);
    const currentTime = dayjs(selectedTime) || end;
    setEnd(currentTime);
    hideEndTimePicker();
  };

  return (
    <View style={styles.container}>
      <Text>When do you want to be prompted?</Text>

      <TouchableOpacity style={styles.timePicker} onPress={showStartTimePicker}>
        <Text>From</Text>
        <View>
          <Text>
            {start.format("h:mm A")}
            <MaterialCommunityIcons name="menu-right" size={15} />
          </Text>
        </View>
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="time"
          date={start.toDate()}
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.timePicker} onPress={showEndTimePicker}>
        <Text>To</Text>
        <Text>
          {end.format("h:mm A")}
          <MaterialCommunityIcons name="menu-right" size={15} />
        </Text>

        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="time"
          date={end.toDate()}
          onConfirm={handleEndTimeConfirm}
          onCancel={hideEndTimePicker}
        />
      </TouchableOpacity>

      <View style={styles.daysContainer}>
        <Text>Days of week</Text>

        <View style={styles.checkBoxGroup}>
          {Object.keys(days).map(day => (
            <View style={styles.checkBoxItem} key={Math.random()}>
              <Checkbox
                value={days[day as Days]}
                onValueChange={value => setDays({ ...days, [day]: value })}
              />
              <Text style={styles.checkBoxLabel}>{dayLabels[day as Days]}</Text>
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
    justifyContent: "center",
    marginTop: 10,
  },
  checkBoxItem: {
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
