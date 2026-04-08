import {
  getHexagramByNumber,
  getHexagrams,
} from "@/services/hexagramService";
import { useQuery } from "@tanstack/react-query";

export function useHexagrams() {
  return useQuery({
    queryKey: ["hexagrams"],
    queryFn: getHexagrams,
  });
}

export function useHexagramByNumber(number: number | null | undefined) {
  const n =
    number != null && number >= 1 && number <= 64 ? Math.floor(number) : null;
  return useQuery({
    queryKey: ["hexagram", n],
    queryFn: () => getHexagramByNumber(n!),
    enabled: n != null,
  });
}
