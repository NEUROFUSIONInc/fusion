import { Linking, Alert } from "react-native";

export const handleSendFeeback = async (
  text?: string,
  onSuccess?: () => void
) => {
  // recipient feed name could be changed later on
  const recipient = "contact@usefusion.app";
  const subject = "Fusion Feedback";
  const body = text ?? "";

  const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  Alert.alert("Send Feedback", "About to navigate to your mail app. Continue", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "OK",
      onPress: () => {
        Linking.openURL(mailtoUrl);
        return onSuccess?.();
      },
    },
  ]);
};
