import * as SecureStore from "expo-secure-store";
import { ReactNode, createContext, useEffect, useState } from "react";

import { UserPreferences } from "~/@types";
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
    enableResearchMode: false,
  });

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
      setUserPreferences({
        enableCopilot: copilotConsent,
        enableResearchMode: false,
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
