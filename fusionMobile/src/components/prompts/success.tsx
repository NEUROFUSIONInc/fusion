import { Image, Text, View } from "react-native";

export const Success = ({ text }: { text: string }) => {
  return (
    <View className="flex flex-col items-center justify-center gap-y-4">
      <Image source={require("../../../assets/success.png")} />
      <Text className="text-white text-base font-sans text-center mt-4">
        {text}
      </Text>
    </View>
  );
};
