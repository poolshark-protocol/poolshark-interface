export default function timeDifference(unixTimestamp: number): string {
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
  
    return `${days}d,${hours}h,${minutes}m`;
  }