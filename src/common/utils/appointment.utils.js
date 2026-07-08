/**
 * Convert time string (HH:mm) to total minutes.
 * Example: "10:30" => 630
 */
export const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    throw new Error("Invalid time format");
  }

  const [hours, minutes] = time.split(":").map(Number);

  return (hours * 60) + minutes;
};

/**
 * Convert total minutes to time string (HH:mm).
 * Example: 630 => "10:30"
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Get day name from Date.
 */
export const getDayName = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[new Date(date).getDay()];
};

/**
 * Generate appointment slots.
 *
 * Example:
 * startTime = "10:00"
 * endTime = "12:00"
 * slotDuration = 30
 *
 * Returns:
 * [
 *   { startTime: "10:00", endTime: "10:30" },
 *   { startTime: "10:30", endTime: "11:00" },
 * ]
 */
export const generateTimeSlots = ({
  startTime,
  endTime,
  slotDuration = 30,
}) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (start >= end) {
    throw new Error("End time must be greater than start time.");
  }

  const slots = [];

  let current = start;

  while (current + slotDuration <= end) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + slotDuration),
    });

    current += slotDuration;
  }

  return slots;
};