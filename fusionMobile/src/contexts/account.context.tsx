import { ReactNode, createContext, useEffect, useState } from "react";

import { nostrService } from "~/services/nostr.service";

export const AccountContext = createContext<null | {
  userNpub: string;
}>(null);

async function fetchUserNpub() {
  const userDetails = await nostrService.getOrCreateNostrAccount();
  return userDetails?.npub;
}

export const AccountContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userNpub, setUserNpub] = useState<string>("");

  useEffect(() => {
    (async () => {
      const npub = await fetchUserNpub();
      setUserNpub(npub!);
    })();
  }, []);

  return (
    <AccountContext.Provider value={{ userNpub }}>
      {children}
    </AccountContext.Provider>
  );
};
