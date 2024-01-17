import { generatePrivateKey } from "nostr-tools";

export const PRIVATE_KEY = "NostrPrivateKey";

export const getPrivateKey = (): string => {
  let privateKey = localStorage.getItem(PRIVATE_KEY);
  if (!privateKey) {
    privateKey = generatePrivateKey();
    localStorage.setItem(PRIVATE_KEY, privateKey);
  }
  return privateKey;
};
