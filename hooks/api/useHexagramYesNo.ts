import {
    getCurrentSeason,
    getHexagramYesNo,
} from "@/services/reflectionService";
import { useQuery } from "@tanstack/react-query";

export function useHexagramYesNo(hexagramNumber: number | null | undefined) {
  const season = getCurrentSeason();
  return useQuery({
    queryKey: ["hexagram-yesno", hexagramNumber, season],
    queryFn: () =>
      getHexagramYesNo({ hexagramNumber: hexagramNumber!, season }),
    enabled:
      typeof hexagramNumber === "number" && Number.isFinite(hexagramNumber),
  });
}
