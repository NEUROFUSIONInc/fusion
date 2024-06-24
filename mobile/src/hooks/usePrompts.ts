import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { PromptContext } from "../contexts";

import { promptService } from "~/services";

export const usePrompts = () => {
  const promptContext = useContext(PromptContext);

  if (!promptContext) {
    throw new Error(
      "useCurrentUser has to be used within <PromptContext.Provider>"
    );
  }

  return promptContext;
};

export const usePromptsQuery = () => {
  const queryInfo = useQuery({
    queryKey: ["prompts"],
    queryFn: promptService.readSavedPrompts,
  });

  return queryInfo;
};
