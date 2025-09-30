export function convertSecondsToTime(seconds: number) {
  const milliseconds = seconds * 1000;
  const dateStamp = new Date(milliseconds);
  const date = dateStamp.toLocaleString(
    new Intl.DateTimeFormat().resolvedOptions().locale,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return date;
}
