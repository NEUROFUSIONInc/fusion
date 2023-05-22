import { FC } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary";
  title: string;
}

export const Button: FC<ButtonProps> = ({ title, ...props }) => (
  <View>
    <TouchableOpacity
      className="py-2 px-4 bg-secondary-600 rounded-md"
      activeOpacity={0.9}
      {...props}
    >
      <Text className="text-white">{title}</Text>
    </TouchableOpacity>
  </View>
);
