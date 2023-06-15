import { NavigationContainer as RNNavigationContainer } from "@react-navigation/native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

export const NavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RNNavigationContainer>{children}</RNNavigationContainer>
    </SafeAreaProvider>
  );
};
