export function timeDifference(unixTimestamp: number): string {
  // Get the current Unix timestamp in milliseconds
  const now = Date.now();

  // Convert the given timestamp to milliseconds
  const pastTime = unixTimestamp * 1000;

  // Calculate the difference in milliseconds
  let difference = now - pastTime;

  // Calculate days, hours, and minutes
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  difference -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(difference / (1000 * 60 * 60));
  difference -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(difference / (1000 * 60));

  // Construct the return string conditionally to exclude 0 values
  let timeString = "";
  if (days > 0) timeString += `${days}d,`;
  if (hours > 0) timeString += `${hours}h,`;
  if (minutes >= 0) timeString += `${minutes}m`;

  // Remove trailing comma if exists
  if (timeString.endsWith(",")) {
    timeString = timeString.slice(0, -1);
  }

  return timeString;
}

export function convertTimestampToDateFormat(
  timestampInSeconds: number,
): string {
  // Multiply timestamp by 1000 to convert seconds to milliseconds
  const date = new Date(timestampInSeconds * 1000);

  // Get day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is zero-based, so we add 1
  const year = date.getFullYear();

  // Format the date components to have leading zeros if needed
  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;

  // Create the DD/MM/YYYY formatted string
  const formattedDate = `${formattedMonth}/${formattedDay}/${year}`;

  return formattedDate;
}
