import {
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useState,
  useEffect,
} from "react";

import { Prompt } from "~/@types";
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
