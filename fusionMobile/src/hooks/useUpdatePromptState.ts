import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useUpdatePromptNotificationState = (id: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.updatePromptNotificationState,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["prompts", id] });

      // Snapshot the previous value
      const previousPrompt = queryClient.getQueryData<Prompt>(["prompts", id]);
      // Optimistically update to the new value
      if (previousPrompt) {
        const data: Prompt = {
          ...previousPrompt,
          uuid: variables.promptUuid,
          additionalMeta: {
            ...previousPrompt.additionalMeta,
            isNotificationActive: variables.isNotificationActive,
          },
        };
        queryClient.setQueryData<Prompt>(["prompts", id], data);
      }

      const previousPrompts = queryClient.getQueryData<Prompt[]>(["prompts"]);
      if (previousPrompts) {
        const data = previousPrompts.map((prompt) =>
          prompt.uuid === id
            ? {
                ...prompt,
                uuid: variables.promptUuid,
                additionalMeta: {
                  ...prompt.additionalMeta,
                  isNotificationActive: variables.isNotificationActive,
                },
              }
            : prompt
        );
        queryClient.setQueryData<Prompt[]>(["prompts"], data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["prompts", id],
      });
    },
  });

  return mutation;
};
