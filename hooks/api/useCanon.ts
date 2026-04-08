import { getLowerCanon, getUpperCanon } from "@/services/canonService";
import { useQuery } from "@tanstack/react-query";

export function useUpperCanon() {
  return useQuery({
    queryKey: ["canon", "upper"],
    queryFn: getUpperCanon,
  });
}

export function useLowerCanon() {
  return useQuery({
    queryKey: ["canon", "lower"],
    queryFn: getLowerCanon,
  });
}
