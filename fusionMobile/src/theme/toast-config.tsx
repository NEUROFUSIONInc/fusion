import { Image, View } from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

import colors from "./colors";

import { WIDTH } from "~/config";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "none",
        borderLeftWidth: 0,
        backgroundColor: colors.tint,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        height: 80,
        width: WIDTH * 0.95,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
        fontFamily: "wsh-med",
        color: colors.white,
      }}
      text2Style={{
        fontSize: 14.5,
        fontWeight: "400",
        fontFamily: "wsh-reg",
        color: colors.gray[300],
        opacity: 0.8,
      }}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View className="bg-tint p-2 rounded-full w-8 h-8 flex items-center justify-center">
          <Image
            source={require("../../assets/success.png")}
            style={{ width: 36, height: 36 }}
          />
        </View>
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
  "notification-active-info": ({ props, ...restProps }) => (
    <BaseToast
      {...restProps}
      style={{
        borderLeftColor: "none",
        borderLeftWidth: 0,
        backgroundColor: colors.tint,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        height: 80,
        width: WIDTH * 0.95,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
        fontFamily: "wsh-med",
        color: colors.white,
      }}
      text2Style={{
        fontSize: 14.5,
        fontWeight: "400",
        fontFamily: "wsh-reg",
        color: colors.gray[300],
        opacity: 0.8,
      }}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View className="bg-tint p-2 rounded-full w-8 h-8 flex items-center justify-center">
          {props.isNotificationActive ? (
            <Image
              source={require("../../assets/success.png")}
              style={{ width: 36, height: 36 }}
            />
          ) : (
            <Image
              source={require("../../assets/pause.png")}
              style={{ width: 36, height: 36 }}
            />
          )}
        </View>
      )}
    />
  ),
};
