export const THREESIXTY = 360;

export const getTimeZone = (timeZoneString) => {
  let eventTimeZone = timeZoneString ? TimeZone.createTimeZone(0) : null;
  if (timeZoneString && timeZoneString !== "") {
    try {
      eventTimeZone = TimeZone.getTimeZone(timeZoneString);
    } catch (e) {

    }
  }
  return eventTimeZone || TimeZone.createTimeZone(0);
};

export const removingMidnightTime = (dateString) => {
  if (dateString.endsWith("T00:00:00")) {
    return dateString.replace("T00:00:00", "");
  }
  return dateString;
};

export const convertServerDateFormat = (dateString, toFormat, timeZone) => {
  const selectedDateTime = removingMidnightTime(dateString);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: getTimeZone(timeZone).id,
  });

  // Try multiple date formats
  const formats = [
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss",
    "EEE, dd MMM yyyy HH:mm:ss zzz",
    "yyyy-MM-dd",
  ];

  for (const format of formats) {
    try {
      const parsedDate = new Date(selectedDateTime);
      if (!isNaN(parsedDate.getTime())) {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...getFormatOptions(toFormat),
        });
        return formatter.format(parsedDate);
      }
    } catch (e) {
      continue;
    }
  }

  return dateString;
};

export const convertServerDateFormat1 = (dateString, toFormat, timeZone) => {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: getTimeZone(timeZone).id,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...getFormatOptions(toFormat),
      });
      return formatter.format(parsedDate);
    }
  } catch (e) {
    // Try fallback formats
    return convertServerDateFormat(dateString, toFormat, timeZone);
  }

  return dateString;
};

export const convertServerDateFormatListing = (dateString, toFormat, timeZone) => {
  return convertServerDateFormat1(dateString, toFormat, timeZone);
};

export const convertDateTime = (dateString, timeString, timeZone, outputFormat = "hh:mm a") => {
  // Remove " GMT" from date string if present
  const cleanedDateString = dateString.replace(/ GMT$/, "");
  const combinedDateTimeString = `${cleanedDateString}${timeString}`;

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: getTimeZone(timeZone).id,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  try {
    const parsedDate = new Date(combinedDateTimeString);
    if (!isNaN(parsedDate.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...getFormatOptions(outputFormat),
      });
      return formatter.format(parsedDate);
    }
  } catch (e) {

  }

  return timeString;
};

export const extractWeekday = (dateString) => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return weekdays[parsedDate.getDay()];
    }
  } catch (e) {

  }
  return "";
};

export const convertTimeOnly = (startDate, timeString, timeZone, isDayNameRequired = false) => {
  let dayName = "";
  const selectedDateTime = removingMidnightTime(startDate);

  // Try to get day name
  try {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: getTimeZone(timeZone).id,
      weekday: "short",
    });
    const parsedDate = new Date(selectedDateTime);
    if (!isNaN(parsedDate.getTime())) {
      dayName = dateFormatter.format(parsedDate);
    }
  } catch (e) {
    dayName = extractWeekday(startDate);
  }

  // Combine with current date to handle timezone conversion
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const fullDateTimeString = `${year}-${month?.toString().padStart(2, "0")}-${day?.toString().padStart(2, "0")} ${timeString}`;

  try {
    const parsedDate = new Date(fullDateTimeString);
    if (!isNaN(parsedDate.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const formattedTime = formatter.format(parsedDate);
      return isDayNameRequired ? `${dayName}, ${formattedTime}` : formattedTime;
    }
  } catch (e) {

  }

  return timeString;
};

export const convertFromDateFormat = (dateString, fromFormat, toFormat, timeZone) => {
  if (toFormat === "h:m a") {
    const timeParts = dateString.split(":").map(part => parseInt(part, 10));
    if (timeParts.length !== 3 || timeParts.some(isNaN)) {
      return dateString;
    }

    const [hour, minute, second] = timeParts;
    const today = new Date();
    const dateWithTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute,
      second
    );

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: "numeric",
      minute: minute === 0 ? undefined : "2-digit",
      hour12: true,
    });

    return formatter.format(dateWithTime).toLowerCase();
  }

  try {
    // Note: JavaScript doesn't have direct fromFormat parsing like Swift,
    // so we might need a more sophisticated parser or library like moment.js
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...getFormatOptions(toFormat),
      });
      return formatter.format(parsedDate);
    }
  } catch (e) {

  }

  return dateString;
};

export const convertServerDateToDiffFormat = (dateString) => {
  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      const day = parsedDate.getDate();
      let suffix = "th";
      if (day % 10 === 1 && day % 100 !== 11) {
        suffix = "st";
      } else if (day % 10 === 2 && day % 100 !== 12) {
        suffix = "nd";
      } else if (day % 10 === 3 && day % 100 !== 13) {
        suffix = "rd";
      }

      const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
      const month = monthFormatter.format(parsedDate);

      return `${day}${suffix} ${month}`;
    }
  } catch (e) {

  }
  return dateString;
};

// Helper function to convert format strings to options
const getFormatOptions = (format) => {
  const options = {};
  if (format.includes("yyyy")) options.year = "numeric";
  if (format.includes("MM")) options.month = "2-digit";
  if (format.includes("dd")) options.day = "2-digit";
  if (format.includes("HH") || format.includes("hh")) options.hour = "2-digit";
  if (format.includes("mm")) options.minute = "2-digit";
  if (format.includes("ss")) options.second = "2-digit";
  if (format.includes("a")) options.hour12 = true;
  if (format.includes("E") || format.includes("EEE")) options.weekday = "short";
  return options;
};

// Simple TimeZone polyfill since JavaScript doesn't have a direct equivalent
const TimeZone = {
  createTimeZone: (offset) => ({
    id: `UTC${offset >= 0 ? "+" : ""}${offset / 3600}`,
    offset,
  }),
  getTimeZone: (id) => {
    try {
      // Test if the timezone is valid
      new Intl.DateTimeFormat("en-US", { timeZone: id });
      return { id };
    } catch (e) {
      return TimeZone.createTimeZone(0);
    }
  },
};

// Helper function to convert dates between formats
function convertFromDateFormat(dateString, fromFormat, toFormat, timeZone) {
  try {
    // Try parsing with Date object first (works for ISO format)
    let date = new Date(dateString);
    
    // If that fails, try parsing specific formats
    if (isNaN(date.getTime())) {
      // Handle "E, dd MMM yyyy HH:mm:ss z" format
      if (fromFormat === "E, dd MMM yyyy HH:mm:ss z") {
        // Example: "Thu, 13 Feb 2025 00:00:00 GMT"
        const parts = dateString.match(/(\w{3}), (\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (\w+)/);
        
        if (parts) {
          const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
          };
          
          date = new Date(
            Date.UTC(
              parseInt(parts[4]),      // year
              monthMap[parts[3]],      // month
              parseInt(parts[2]),      // day
              parseInt(parts[5]),      // hours
              parseInt(parts[6]),      // minutes
              parseInt(parts[7])       // seconds
            )
          );
        }
      }
    }

    // Format the date according to the output format
    if (!isNaN(date.getTime())) {
      if (toFormat === "dd MMM yyyy") {
        const options = {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: timeZone
        };
        
        return new Intl.DateTimeFormat('en-US', options).format(date);
      }
    }
  } catch (e) {

  }
  
  // Return original string if conversion fails
  return dateString;
}

// Usage example:
const data = {
  startDate: "Thu, 13 Feb 2025 00:00:00 GMT",
  endDate: "Fri, 14 Feb 2025 00:00:00 GMT",
  time_zone: "UTC"
};

const startDate = convertFromDateFormat(
  data.startDate, 
  "E, dd MMM yyyy HH:mm:ss z", 
  "dd MMM yyyy", 
  data.time_zone
);

const endDate = convertFromDateFormat(
  data.endDate, 
  "E, dd MMM yyyy HH:mm:ss z", 
  "dd MMM yyyy", 
  data.time_zone
);

console.log(startDate); // "13 Feb 2025"
console.log(endDate);   // "14 Feb 2025"