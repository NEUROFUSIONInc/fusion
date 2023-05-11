import { NavigationContainer as RNNavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const NavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SafeAreaProvider>
      <RNNavigationContainer>{children}</RNNavigationContainer>
    </SafeAreaProvider>
  );
};
