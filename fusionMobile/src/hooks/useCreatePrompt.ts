import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.savePrompt,
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["prompts"] });

      // Snapshot the previous value
      const previousPrompts = queryClient.getQueryData<Prompt[]>(["prompts"]);

      // Optimistically update to the new value
      if (previousPrompts && data) {
        queryClient.setQueryData<Prompt[]>(
          ["prompts"],
          [...previousPrompts, data]
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });
    },
  });

  return mutation;
};
