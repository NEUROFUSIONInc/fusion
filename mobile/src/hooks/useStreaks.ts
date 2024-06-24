import { useQuery } from "@tanstack/react-query";

import { streakService } from "~/services";

export const useStreaksQuery = (timestamp: number = -1) => {
  const queryInfo = useQuery({
    queryKey: ["streaks", timestamp],
    queryFn: () => streakService.getStreakScore(timestamp),
  });

  return queryInfo;
};
