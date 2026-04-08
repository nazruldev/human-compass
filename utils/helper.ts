export function getSeason(date: Date) {
  const month = date.getMonth() + 1;

  if (month <= 3) return "spring";
  if (month <= 6) return "summer";
  if (month <= 9) return "autumn";
  return "winter";
}
