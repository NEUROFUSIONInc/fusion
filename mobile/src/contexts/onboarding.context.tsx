import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, createContext, useEffect, useState } from "react";

export const OnboardingContext = createContext<null | {
  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

export const OnboardingContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const onboardingViewed = await AsyncStorage.getItem("onboarding_viewed");
      if (onboardingViewed !== "true") {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    })();
  }, [showOnboarding]);

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};
