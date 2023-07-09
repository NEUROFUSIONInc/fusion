import { useQuery } from "@tanstack/react-query";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const usePrompt = (id: string, defaultPrompt?: Prompt) => {
  const queryInfo = useQuery({
    queryKey: ["prompt", id],
    queryFn: () => promptService.getPrompt(id),
    enabled: Boolean(id),
    initialData: defaultPrompt,
  });

  return queryInfo;
};
