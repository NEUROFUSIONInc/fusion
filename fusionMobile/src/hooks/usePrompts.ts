import { useContext } from "react";

import { PromptContext } from "../contexts";

export const usePrompts = () => {
  const promptContext = useContext(PromptContext);

  if (!promptContext) {
    throw new Error(
      "useCurrentUser has to be used within <PromptContext.Provider>"
    );
  }

  return promptContext;
};
