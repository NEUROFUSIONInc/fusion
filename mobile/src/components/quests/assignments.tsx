import dayjs from "dayjs";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";

interface QuestAssignment {
  questId: string;
  timestamp: number;
  assignment: string;
}

interface AssignmentsProps {
  todayAssignment: string | null;
  allAssignments: QuestAssignment[];
}

export function Assignments({
  todayAssignment,
  allAssignments,
}: AssignmentsProps) {
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  if (!todayAssignment) return null;

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
              <Pressable
                onPress={() => setShowAssignmentsModal(false)}
                className="p-2"
              >
                <Text className="text-white text-xl">×</Text>
              </Pressable>
            </View>
            <ScrollView>
              {allAssignments.map((a, index) => (
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
