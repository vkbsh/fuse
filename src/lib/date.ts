export function convertSecondsToDate(seconds: number) {
  const milliseconds = seconds * 1000;
  const dateStamp = new Date(milliseconds);

  const formatted = dateStamp.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatted.replace(",", ",");
}
