import {
  Image,
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

import colors from "./colors";

import { WIDTH } from "~/config";

// Common styles
const toastContainerStyle: StyleProp<ViewStyle> = {
  borderLeftColor: "none",
  borderLeftWidth: 0,
  backgroundColor: colors.tint,
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 10,
  height: 80,
  width: WIDTH * 0.95,
  borderRadius: 8,
};

const toastText1Style: StyleProp<TextStyle> = {
  fontSize: 17,
  fontWeight: "bold",
  fontFamily: "wsh-med",
  color: colors.white,
};

const toastText2Style: StyleProp<TextStyle> = {
  fontSize: 14.5,
  fontWeight: "400",
  fontFamily: "wsh-reg",
  color: colors.gray[300],
  opacity: 0.8,
};

// Common components
const LeadingIcon = ({ iconSource }: { iconSource: ImageSourcePropType }) => (
  <View className="bg-tint p-2 rounded-full w-8 h-8 flex items-center justify-center">
    <Image source={iconSource} style={{ width: 36, height: 36 }} />
  </View>
);

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={toastContainerStyle}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={toastText1Style}
      text2Style={toastText2Style}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <LeadingIcon iconSource={require("../../assets/success.png")} />
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 17 }}
      text2Style={{ fontSize: 15 }}
    />
  ),
  "notification-active-info": ({ props, ...restProps }) => (
    <BaseToast
      {...restProps}
      style={toastContainerStyle}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={toastText1Style}
      text2Style={toastText2Style}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <LeadingIcon
          iconSource={
            props.isNotificationActive
              ? require("../../assets/success.png")
              : require("../../assets/pause.png")
          }
        />
      )}
    />
  ),
};
