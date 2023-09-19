import { ReactNode, createContext, useEffect, useState } from "react";

import { nostrService } from "~/services/nostr.service";

export const AccountContext = createContext<null | {
  userNpub: string;
  userApiToken: string;
}>(null);

export const AccountContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userNpub, setUserNpub] = useState<string>("");
  const [userApiToken, setUserApiToken] = useState<string>("");

  useEffect(() => {
    (async () => {
      const userDetails = await nostrService.getOrCreateNostrAccount();
      setUserNpub(userDetails!.npub);

      // now make request to get api token
      const apiToken = await nostrService.getApiToken(userDetails!);
      setUserApiToken(apiToken!);
    })();
  }, []);

  return (
    <AccountContext.Provider value={{ userNpub, userApiToken }}>
      {children}
    </AccountContext.Provider>
  );
};
