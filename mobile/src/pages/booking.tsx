import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";

import { AccountContext } from "~/contexts";
import { notificationService } from "~/services";
import { appInsights } from "~/utils";

export const BookingScreen = () => {
  const navigation = useNavigation();
  const accountContext = React.useContext(AccountContext);
  const handleCalendlyEvent = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === "calendly.event_scheduled") {
      appInsights.trackEvent({
        name: "Meeting booked",
        properties: {
          userNpub: accountContext?.userNpub,
        },
      });

      console.log("Meeting booked:", data);

      (async () => {
        await notificationService.disableCustomNotificationByTitle("outreach");
      })();

      // show success toast
      Toast.show({
        type: "success",
        text1: "Meeting booked with Fusion Team",
        text2: "We look forward to speaking with you soon!",
      });
      // send to the home page
      navigation.navigate("HomeNavigator", {
        screen: "HomePage",
      });
    }
  };

  React.useEffect(() => {
    appInsights.trackPageView({
      name: "BookingPage",
      properties: {
        userNpub: accountContext?.userNpub,
      },
    });

    //   disable the notification after they've viewed the booking page at least 3 times
    //  This is a work around because the android version of the app doesn't send the event when meeting is booked
    //  edit: also getting the bug on ios so this should do
    (async () => {
      const getViewCount = await AsyncStorage.getItem("bookingPageViewCount");
      if (!getViewCount) {
        await AsyncStorage.setItem("bookingPageViewCount", "1");
      } else {
        const count = parseInt(getViewCount, 10);
        if (count >= 3) {
          await notificationService.disableCustomNotificationByTitle(
            "outreach"
          );
        } else {
          await AsyncStorage.setItem(
            "bookingPageViewCount",
            (count + 1).toString()
          );
        }
      }
    })();
  }, []);

  const source =
    Platform.OS === "ios"
      ? require("../../assets/html/calendly.html")
      : { uri: "file:///android_asset/calendly.html" };

  return (
    <WebView
      source={source}
      style={{ flex: 1, margin: 0, padding: 0 }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleCalendlyEvent}
    />
  );
};
