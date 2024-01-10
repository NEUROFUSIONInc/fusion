import { useQuery } from "@tanstack/react-query";

import { promptService } from "~/services";

export const usePromptResponsesQuery = (promptUuid: string) => {
  const queryInfo = useQuery({
    queryKey: ["promptResponses", promptUuid],
    queryFn: () => promptService.getPromptResponses(promptUuid),
  });

  return queryInfo;
};
