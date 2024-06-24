import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";

import { UserPreferences } from "~/@types";
import { categories } from "~/config";
import { nostrService } from "~/services/nostr.service";

export const AccountContext = createContext<null | {
  userNpub: string;
  userApiToken: string;
  userLoading: boolean;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}>(null);

export const AccountContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userNpub, setUserNpub] = useState<string>("");
  const [userApiToken, setUserApiToken] = useState<string>("");
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    enableCopilot: false,
    enableHealthConnect: false,
    lastActiveCategory: "",
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    console.log("accoount context, isFirstRender", isFirstRender.current);
    console.log("user preferences", userPreferences);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    (async () => {
      await AsyncStorage.setItem(
        "copilot_consent",
        userPreferences.enableCopilot.toString()
      );
      await AsyncStorage.setItem(
        "health_connect",
        userPreferences.enableHealthConnect.toString()
      );
      await AsyncStorage.setItem(
        "last_active_category",
        userPreferences.lastActiveCategory ?? categories[0].name
      );
    })();
  }, [userPreferences]);

  useEffect(() => {
    (async () => {
      const userDetails = await nostrService.getOrCreateNostrAccount();
      setUserNpub(userDetails!.npub);

      // now make request to get api token
      console.log("getting api token");
      const apiToken = await nostrService.getApiToken(userDetails!);
      console.log("api token", apiToken);
      setUserApiToken(apiToken!);

      // now make request to get user preferences
      const copilotConsent =
        (await AsyncStorage.getItem("copilot_consent")) === "true";

      const healthConnect =
        (await AsyncStorage.getItem("health_connect")) === "true";

      const lastActiveCategory = await AsyncStorage.getItem(
        "last_active_category"
      );

      setUserPreferences({
        enableCopilot: copilotConsent,
        enableHealthConnect: healthConnect,
        lastActiveCategory: lastActiveCategory ?? categories[0].name,
      });

      setUserLoading(false);
    })();
  }, []);

  // we need a logic to retry when the token expires

  return (
    <AccountContext.Provider
      value={{
        userNpub,
        userApiToken,
        userLoading,
        userPreferences,
        setUserPreferences,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
