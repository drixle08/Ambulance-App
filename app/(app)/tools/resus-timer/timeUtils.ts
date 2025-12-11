export function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatTPlus(totalSeconds: number): string {
  return `T+${formatSeconds(totalSeconds)}`;
}
