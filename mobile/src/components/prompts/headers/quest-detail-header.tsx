import { useNavigation } from "@react-navigation/native";
import { AxiosError } from "axios";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import DeviceInfo from "react-native-device-info";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

import { AccountContext } from "~/contexts";
import { useDeleteQuest } from "~/hooks";
import { handleSendFeeback } from "~/services";
import { connectWithVital, getApiService, pushVitalData } from "~/utils";

export const QuestDetailHeader = () => {
  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);
  const { mutate: deleteQuest } = useDeleteQuest();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    // TODO: send the user back to the quest list page
    navigation.goBack();
  };

  return (
    <View className="flex flex-row p-5 justify-between flex-nowrap bg-dark">
      <Button
        variant="ghost"
        size="icon"
        leftIcon={<LeftArrow width={32} height={32} />}
        onPress={handleGoBack}
      />
      <Text className="font-sans text-base text-white">Quest</Text>

      {isLoading ? (
        <View className="w-8 h-8 justify-center items-center">
          <ActivityIndicator color="white" />
        </View>
      ) : accountContext?.userPreferences?.activeQuest?.guid?.toLowerCase() ===
        "4705ba7b-55b6-4c99-afb7-45c3a1fcf7ee" ? (
        <ContextMenu
          title="Options"
          dropdownMenuMode
          actions={[
            { title: "Share Health Data" },
            { title: "Redeem Gift Code" },
            { title: "Feedback" },
            { title: "Leave Quest", destructive: true },
          ]}
          onPress={(e) => {
            if (e.nativeEvent.index === 0) {
              // share health data
              const options = ["Oura", "Whoop"];
              if (Platform.OS === "ios") {
                options.push("Apple Health");
              }
              Alert.alert(
                "Connect your Health Data",
                "Select your health data source",
                options.map((option) => ({
                  text: option,
                  onPress: async () => {
                    setIsLoading(true);
                    try {
                      const deviceId = await DeviceInfo.getUniqueId();
                      const linkToken = await connectWithVital(
                        accountContext?.userPreferences?.activeQuest!.guid!,
                        option,
                        deviceId
                      );

                      if (!linkToken) {
                        console.error("Failed to get link token");
                        return;
                      }
                      // Handle the linkToken if needed
                      if (["oura", "whoop"].includes(option.toLowerCase())) {
                        Linking.openURL(linkToken);
                      } else {
                        const res = await pushVitalData(
                          accountContext?.userNpub!,
                          accountContext?.userPreferences?.activeQuest!.guid!
                        );

                        if (res) {
                          Alert.alert(
                            "Success",
                            "Your health data has been successfully shared. Please remember to wear your watch to sleep daily."
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Failed to connect health data", error);
                      Alert.alert("Error", "Failed to connect health data");
                    } finally {
                      setIsLoading(false);
                    }
                  },
                }))
              );
            } else if (e.nativeEvent.index === 1) {
              // redeem gift card
              setIsLoading(true);
              (async () => {
                try {
                  const apiService = await getApiService();
                  if (!apiService) {
                    setIsLoading(false);
                    return;
                  }

                  const deviceId = await DeviceInfo.getUniqueId();
                  const res = await apiService.post("/quest/redeem-gift-card", {
                    questId:
                      accountContext?.userPreferences?.activeQuest!.guid!,
                    deviceId,
                  });

                  if (res.status === 200) {
                    Alert.alert("Your Gift Code is", res.data.code);
                  } else {
                    Alert.alert("Error", res.data.error);
                  }
                } catch (error) {
                  if (
                    error instanceof AxiosError &&
                    error.response?.data?.error
                  ) {
                    Alert.alert("Error", error.response.data.error);
                  } else {
                    console.error("Failed to redeem gift card", error);
                    Alert.alert("Error", "An unexpected error occurred");
                  }
                } finally {
                  setIsLoading(false);
                }
              })();
            } else if (e.nativeEvent.index === 2) {
              return handleSendFeeback("");
            } else if (e.nativeEvent.index === 3) {
              // confirm delete
              Alert.alert(
                "Leave Quest",
                "Are you sure you want to leave this quest? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteQuest(
                          accountContext?.userPreferences?.activeQuest!.guid!
                        );
                        navigation.goBack();
                      } catch (error) {
                        console.error("Failed to leave quest", error);
                      }
                    },
                  },
                ]
              );
            }
          }}
        >
          <Button variant="ghost" size="icon" leftIcon={<VerticalMenu />} />
        </ContextMenu>
      ) : (
        <ContextMenu
          title="Options"
          dropdownMenuMode
          actions={[
            { title: "Feedback" },
            { title: "Leave Quest", destructive: true },
          ]}
          onPress={(e) => {
            if (e.nativeEvent.index === 0) {
              return handleSendFeeback("");
            } else if (e.nativeEvent.index === 1) {
              // confirm delete
              Alert.alert(
                "Leave Quest",
                "Are you sure you want to leave this quest? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteQuest(
                          accountContext?.userPreferences?.activeQuest!.guid!
                        );
                        navigation.goBack();
                      } catch (error) {
                        console.error("Failed to leave quest", error);
                      }
                    },
                  },
                ]
              );
            }
          }}
        >
          <Button variant="ghost" size="icon" leftIcon={<VerticalMenu />} />
        </ContextMenu>
      )}
    </View>
  );
};
