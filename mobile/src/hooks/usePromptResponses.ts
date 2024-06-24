import { useQuery } from "@tanstack/react-query";

import { promptService } from "~/services";

export const usePromptResponsesQuery = (
  promptUuid: string,
  startTimestamp: number = -1,
  endTimestamp: number = -1
) => {
  const queryInfo = useQuery({
    // TODO: re-enable when we start invalidating on save of prompt response
    queryKey: ["promptResponses", promptUuid, startTimestamp, endTimestamp],
    queryFn: () =>
      promptService.getPromptResponses(
        promptUuid,
        startTimestamp,
        endTimestamp
      ),
  });

  return queryInfo;
};
