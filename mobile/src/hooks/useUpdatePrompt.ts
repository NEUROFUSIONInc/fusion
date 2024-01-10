import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Prompt } from "~/@types";
import { promptService } from "~/services";

export const useUpdatePrompt = (id: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: promptService.savePrompt,
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["prompt", id] });

      const previousPrompt = queryClient.getQueryData<Prompt>(["prompt", id]);
      if (previousPrompt && data) {
        queryClient.setQueryData<Prompt>(["prompt", id], data);
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

      Toast.show({
        type: "success",
        text1: "Prompt updated",
        text2: "Your prompt has been updated successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["prompt", id],
      });
    },
  });

  return mutation;
};
