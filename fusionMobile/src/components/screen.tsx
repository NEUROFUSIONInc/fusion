import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  children: ReactNode;
};

export const Screen = ({ children }: Props) => {
  return (
    <View className="flex flex-1 flex-col w-full h-full bg-dark px-2">
      {children}
    </View>
  );
};
