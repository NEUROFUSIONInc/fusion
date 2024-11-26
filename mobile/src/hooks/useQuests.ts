import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

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
        queryKey: ["quests", "prompts"],
      });
    },
  });

  return mutation;
};

export const useDeleteQuest = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: questService.deleteQuest,
    onSuccess: async (status, guid) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] });

      const previousQuests = queryClient.getQueryData<Quest[]>(["quests"]);

      if (previousQuests) {
        queryClient.setQueryData<Quest[]>(
          ["quests"],
          [...previousQuests.filter((quest) => quest.guid !== guid)]
        );
      }

      if (status) {
        Toast.show({
          type: "success",
          text1: "Quest deleted",
          text2:
            "You have left the quest and will need to rejoin to participate again.",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["quests", "prompts"],
      });
    },
  });

  return mutation;
};
