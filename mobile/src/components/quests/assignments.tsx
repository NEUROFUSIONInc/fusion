import { FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Button } from "../button";

import { Quest } from "~/@types";
import { questService } from "~/services/quest.service";

interface QuestAssignment {
  questId: string;
  timestamp: number;
  assignment: string;
}

interface AssignmentsProps {
  quest: Quest;
  todayAssignment: string | null;
  allAssignments: QuestAssignment[];
  isLoading: boolean;
}

export function Assignments({
  quest,
  todayAssignment,
  allAssignments,
  isLoading,
}: AssignmentsProps) {
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  const [localAssignments, setLocalAssignments] = useState<QuestAssignment[]>();

  useEffect(() => {
    setLocalAssignments(allAssignments);
  }, [allAssignments]);

  if (isLoading || !todayAssignment) return null;

  return (
    <View className="mt-4">
      <TouchableOpacity
        onPress={() => setShowAssignmentsModal(true)}
        className="bg-secondary-900 p-4 rounded-lg"
      >
        <Text className="text-white font-sans text-base">
          {todayAssignment}
        </Text>

        {allAssignments.length > 0 && (
          <Text className="text-white opacity-60 text-sm font-sans mt-2">
            Tap to view all assignments
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={showAssignmentsModal}
        onRequestClose={() => setShowAssignmentsModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-secondary-900 w-11/12 h-[80%] rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-sans text-lg">
                All Assignments
              </Text>

              <>
                <Button
                  leftIcon={<FontAwesome5 name="history" size={18} />}
                  onPress={() => {
                    setIsDateTimePickerVisible(true);
                  }}
                  title="Change time"
                  className="p-3"
                />
                <Pressable
                  onPress={() => setShowAssignmentsModal(false)}
                  className="p-2"
                >
                  <Text className="text-white text-xl">×</Text>
                </Pressable>
              </>

              {localAssignments && (
                <DateTimePickerModal
                  isVisible={isDateTimePickerVisible}
                  mode="time"
                  date={new Date(localAssignments[0]?.timestamp || new Date())}
                  onConfirm={async (selectedTime: Date) => {
                    const hour = selectedTime.getHours();
                    const minute = selectedTime.getMinutes();
                    const updatedAssignments =
                      await questService.updateQuestAssignmentTime(
                        quest,
                        hour,
                        minute
                      );

                    if (updatedAssignments) {
                      setLocalAssignments(updatedAssignments);
                    }
                    setIsDateTimePickerVisible(false);
                  }}
                  onCancel={() => {
                    setIsDateTimePickerVisible(false);
                  }}
                />
              )}
            </View>

            <ScrollView>
              {localAssignments?.map((a, index) => (
                <View
                  key={index}
                  className="bg-secondary-800 p-4 rounded-lg mb-2"
                >
                  <Text className="text-white opacity-60 text-sm font-sans mb-1">
                    {dayjs(a.timestamp).format("MMM D, YYYY - h:mm A")}
                  </Text>
                  <Text className="text-white font-sans text-base">
                    {a.assignment}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
