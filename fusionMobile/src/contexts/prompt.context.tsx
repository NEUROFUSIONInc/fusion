import {
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Alert } from "react-native";

import { Prompt } from "~/@types";
import { createBaseTables } from "~/lib";
import { promptService } from "~/services";

export const PromptContext = createContext<null | {
  loading: boolean;
  savedPrompts: Prompt[];
  setSavedPrompts: Dispatch<SetStateAction<Prompt[]>>;
}>(null);

export const PromptContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    (async () => {
      const setupStatus = await createBaseTables();

      if (!setupStatus) {
        setLoading(false);
        Alert.alert("Error", "There was an error setting up the app.");
      }

      const res = await promptService.readSavedPrompts();
      if (res) {
        setSavedPrompts(res);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <PromptContext.Provider value={{ loading, savedPrompts, setSavedPrompts }}>
      {children}
    </PromptContext.Provider>
  );
};
