import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useUpdatePrompt = (id: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.savePrompt,
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["prompts", id] });

      const previousPrompt = queryClient.getQueryData<Prompt>(["prompts", id]);
      if (previousPrompt && data) {
        queryClient.setQueryData<Prompt>(["prompts", id], data);
      }

      const previousPrompts = queryClient.getQueryData<Prompt[]>(["prompts"]);
      if (previousPrompts && data) {
        queryClient.setQueryData<Prompt[]>(
          ["prompts"],
          previousPrompts.map((prompt) =>
            prompt.uuid === data.uuid ? data : prompt
          )
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["prompts", id],
      });
    },
  });

  return mutation;
};
