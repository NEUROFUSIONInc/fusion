import * as SecureStore from "expo-secure-store";
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    SecureStore.setItemAsync(
      "copilot_consent",
      userPreferences.enableCopilot.toString()
    );
    SecureStore.setItemAsync(
      "health_connect",
      userPreferences.enableHealthConnect.toString()
    );
    SecureStore.setItemAsync(
      "last_active_category",
      userPreferences.lastActiveCategory ?? categories[0].name
    );
  }, [userPreferences]);

  useEffect(() => {
    (async () => {
      const userDetails = await nostrService.getOrCreateNostrAccount();
      setUserNpub(userDetails!.npub);

      // now make request to get api token
      const apiToken = await nostrService.getApiToken(userDetails!);
      setUserApiToken(apiToken!);

      // now make request to get user preferences
      const copilotConsent =
        (await SecureStore.getItemAsync("copilot_consent")) === "true";

      const healthConnect =
        (await SecureStore.getItemAsync("health_connect")) === "true";

      const lastActiveCategory = await SecureStore.getItemAsync(
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
