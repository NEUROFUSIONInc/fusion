import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.deletePrompt,
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries({
        queryKey: ["prompts"],
      }); // Snapshot the previous value

      const previousPrompts = queryClient.getQueryData<Prompt[]>(["prompts"]); // Optimistically update to the new value
      if (previousPrompts) {
        queryClient.setQueryData<Prompt[]>(
          ["prompts"],
          [...previousPrompts.filter((prompt) => prompt.uuid !== id)]
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
