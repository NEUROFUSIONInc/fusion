import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useUpdatePromptNotificationState = (id: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.updatePromptNotificationState,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["prompt", id] });

      // Snapshot the previous value
      const previousPrompt = queryClient.getQueryData<Prompt>(["prompt", id]);
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
        queryClient.setQueryData<Prompt>(["prompt", id], data);
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
    onSuccess: (data) => {
      const isNotificationActive = data?.additionalMeta?.isNotificationActive;
      Toast.show({
        type: "notification-active-info",
        text1: "Prompt updated",
        text2: `Your prompt has been successfully ${
          isNotificationActive ? "enabled" : "paused"
        }`,
        props: {
          isNotificationActive,
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });
    },
  });

  return mutation;
};
