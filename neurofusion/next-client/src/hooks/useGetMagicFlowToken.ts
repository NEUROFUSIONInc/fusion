import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { magicflowService } from "~/services";

export const useGetMagicFlowToken = () => {
  const { data: sessionData } = useSession();
  const queryInfo = useQuery({
    queryKey: ["magicflowToken"],
    queryFn: () => magicflowService.getMagicFlowToken(sessionData?.user?.authToken),
    enabled: Boolean(sessionData?.user?.authToken),
  });
  return queryInfo;
};
