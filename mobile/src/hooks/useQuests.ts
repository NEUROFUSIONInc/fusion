import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Quest } from "~/@types";
import { questService } from "~/services/quest.service";

export const useQuestsQuery = () => {
  const queryInfo = useQuery({
    queryKey: ["quests"],
    queryFn: questService.fetchActiveQuests,
  });

  return queryInfo;
};

export const useCreateQuest = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: questService.saveQuest,
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] });

      const previousQuests = queryClient.getQueryData<Quest[]>(["quests"]);

      if (previousQuests && data) {
        queryClient.setQueryData<Quest[]>(
          ["quests"],
          [...previousQuests, data]
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["quests"],
      });
    },
  });

  return mutation;
};
