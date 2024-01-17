import { generatePrivateKey } from "nostr-tools";

export const getPrivateKey = (): string => {
  let privateKey = localStorage.getItem("privateKey");
  if (!privateKey) {
    privateKey = generatePrivateKey();
    localStorage.setItem("privateKey", privateKey);
  }
  return privateKey;
};
