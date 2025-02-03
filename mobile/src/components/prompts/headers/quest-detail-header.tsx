import { useNavigation } from "@react-navigation/native";
import { VitalCore } from "@tryvital/vital-core-react-native";
import {
  VitalHealth,
  HealthConfig,
  VitalResource,
} from "@tryvital/vital-health-react-native";
import React from "react";
import { Alert, Linking, Platform, Text, View } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { Button } from "../../button";
import { LeftArrow, VerticalMenu } from "../../icons";

import { AccountContext } from "~/contexts";
import { useDeleteQuest } from "~/hooks";
import { handleSendFeeback } from "~/services";
import { connectWithVital } from "~/utils";

export const QuestDetailHeader = () => {
  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);
  const { mutate: deleteQuest } = useDeleteQuest();

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

      <ContextMenu
        title="Options"
        dropdownMenuMode
        actions={[
          { title: "Share Health Data" },
          { title: "Feedback" },
          { title: "Leave Quest", destructive: true },
        ]}
        onPress={(e) => {
          if (e.nativeEvent.index === 0) {
            const options = ["Oura"];
            if (Platform.OS === "ios") {
              options.push("Apple Health");
            }
            Alert.alert(
              "Connect your Health Data",
              "Select your health data source",
              options.map((option) => ({
                text: option,
                onPress: async () => {
                  const linkToken = await connectWithVital(
                    accountContext?.userPreferences?.activeQuest!.guid!,
                    option
                  );

                  if (!linkToken) {
                    console.error("Failed to get link token");
                    return;
                  }
                  // Handle the linkToken if needed
                  if (option === "Oura") {
                    Linking.openURL(linkToken);
                  } else {
                    // sign in the user
                    try {
                      try {
                        const status = await VitalCore.status();
                        if (status.includes("signedIn")) {
                          console.log("already signed in");
                          await VitalCore.signOut();
                        }
                        await VitalCore.signIn(linkToken);
                      } catch (error) {
                        console.error("Failed to sign in", error);
                      }

                      const config = new HealthConfig();
                      config.iOSConfig.backgroundDeliveryEnabled = true;
                      await VitalHealth.configure(config);

                      await VitalHealth.ask(
                        [
                          VitalResource.Sleep,
                          VitalResource.HeartRate,
                          VitalResource.HeartRateVariability,
                          VitalResource.BloodOxygen,
                          VitalResource.Steps,
                        ],
                        []
                      );

                      await VitalHealth.syncData();
                    } catch (error) {
                      console.error("Failed to sign in", error);
                    }
                  }
                },
              }))
            );
          } else if (e.nativeEvent.index === 1) {
            return handleSendFeeback("");
          } else if (e.nativeEvent.index === 2) {
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
    </View>
  );
};
