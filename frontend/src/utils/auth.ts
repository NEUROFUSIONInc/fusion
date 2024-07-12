import { generatePrivateKey, getPublicKey } from "nostr-tools";

export const PRIVATE_KEY = "NostrPrivateKey";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export const getPrivateKey = (): string => {
  let privateKey = localStorage.getItem(PRIVATE_KEY);
  if (!privateKey) {
    privateKey = generatePrivateKey();
    localStorage.setItem(PRIVATE_KEY, privateKey);
  }
  return privateKey;
};

export const persistPrivateKey = (privateKey: string): Promise<KeyPair> => {
  if (privateKey && privateKey.length === 64) {
    localStorage.setItem(PRIVATE_KEY, privateKey);
    const publicKey = getPublicKey(privateKey);
    return Promise.resolve({ publicKey, privateKey });
  } else {
    // TODO: render error message
    return Promise.reject("Invalid private key");
  }
};

export const deletePrivateKey = (): void => {
  localStorage.removeItem(PRIVATE_KEY);
};
