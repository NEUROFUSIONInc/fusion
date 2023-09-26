import { ReactNode, createContext, useEffect, useState } from "react";

import { nostrService } from "~/services/nostr.service";

export const AccountContext = createContext<null | {
  userNpub: string;
  userApiToken: string;
  userLoading: boolean;
}>(null);

export const AccountContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userNpub, setUserNpub] = useState<string>("");
  const [userApiToken, setUserApiToken] = useState<string>("");
  const [userLoading, setUserLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const userDetails = await nostrService.getOrCreateNostrAccount();
      setUserNpub(userDetails!.npub);

      // now make request to get api token
      const apiToken = await nostrService.getApiToken(userDetails!);
      setUserApiToken(apiToken!);

      setUserLoading(false);
    })();
  }, []);

  return (
    <AccountContext.Provider value={{ userNpub, userApiToken, userLoading }}>
      {children}
    </AccountContext.Provider>
  );
};
